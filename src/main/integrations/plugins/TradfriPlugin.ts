import {
  discoverGateway,
  DiscoveredGateway,
  TradfriClient,
} from "node-tradfri-client";
import { BaseIntegrationPlugin } from "../BaseIntegrationPlugin";
import { globalConfig, patchConfig } from "../../ipc/config";
import {
  IntegrationPlugin,
  IntegrationControlArgs,
  IntegrationHealthStatus,
  ListDevicesResponse,
  IntegrationUtilityFunction,
  ControlType,
} from "../../../shared/types/integration";
import {
  rgbToHueSat,
  getTradfriColorTempFromEvent,
} from "../utils/colorConversions";
import { IConfig } from "../../../shared/types/config";

export class TradfriPlugin extends BaseIntegrationPlugin {
  readonly id = IntegrationPlugin.TRADFRI;
  readonly name = "IKEA Tradfri";
  readonly enabledConfigKey = "ikeaEnabled";
  readonly restartConfigKeys: (keyof IConfig)[] = ["ikeaGatewayIp"];

  async initialize(): Promise<void> {
    this.log("debug", "Initializing IKEA Tradfri...");
    await this.healthCheck();
  }

  async healthCheck(): Promise<IntegrationHealthStatus> {
    const client = await this.getClient();
    if (!client) {
      this.setOnline(false);
      return "offline";
    }

    const ping = await client.ping();
    this.setOnline(ping);
    return ping ? "online" : "offline";
  }

  async listDevices(): Promise<ListDevicesResponse> {
    const client = await this.getClient();
    if (!client) {
      return { devices: [], selectedDevices: [] };
    }

    await client.observeDevices();

    const deviceList = Object.values(client.devices)
      .filter((device) => device.type === 2)
      .map((device) => ({
        id: device.instanceId,
        label: device.name,
        state: device.lightList[0]?.onOff,
        metadata: {
          type: device.type,
          spectrum: device.lightList[0]?.spectrum,
        },
      }));

    return {
      devices: deviceList,
      selectedDevices: globalConfig.ikeaDeviceIds,
    };
  }

  async control(args: IntegrationControlArgs): Promise<void> {
    const { controlType, color, brightness, event } = args;

    const client = await this.getClient();
    if (!client) return;

    await client.observeDevices();
    const devices = Object.values(client.devices).filter(
      (device) =>
        device.type === 2 &&
        globalConfig.ikeaDeviceIds.includes(device.instanceId),
    );

    for (const device of devices) {
      const light = device.lightList[0];
      // @ts-ignore
      light.link(client);
      if (!light) continue;

      const { hue: hueValue, sat: satValue } = rgbToHueSat(
        color.r,
        color.g,
        color.b,
      );

      switch (controlType) {
        case ControlType.ON:
          if (light.spectrum === "rgb") {
            light.toggle(true);
            light.setHue(hueValue);
            light.setSaturation(satValue);
            light.setBrightness(brightness);
          } else {
            const temp = getTradfriColorTempFromEvent(event);
            light.toggle(true);
            light.setColorTemperature(temp ?? 370);
          }
          break;

        case ControlType.OFF:
          light.toggle(false);
          break;
      }
    }
  }

  getUtilityFunctions(): IntegrationUtilityFunction[] {
    return [
      {
        name: "discoverGateway",
        description: "Discover IKEA Tradfri gateway on the network",
        handler: async () => this.discoverGateway(),
      },
    ];
  }

  private async discoverGateway(): Promise<DiscoveredGateway | null> {
    return await discoverGateway();
  }

  private async getClient(): Promise<TradfriClient | null> {
    const gatewayIp = globalConfig.ikeaGatewayIp;
    const securityCode = globalConfig.ikeaSecurityCode;
    const identity = globalConfig.ikeaIdentity;
    const preSharedKey = globalConfig.ikeaPreSharedKey;

    if (!gatewayIp) {
      this.log("error", "No IKEA Tradfri gateway IP set");
      return null;
    }

    if (!securityCode) {
      this.log("error", "No IKEA Tradfri security code set");
      return null;
    }

    const tradfriClient = new TradfriClient(gatewayIp, {
      watchConnection: true,
    });

    if (!identity || !preSharedKey) {
      try {
        const { identity: newIdentity, psk } =
          await tradfriClient.authenticate(securityCode);
        if (!newIdentity || !psk) {
          this.log("error", "Error authenticating with IKEA Tradfri gateway");
          return null;
        }
        await patchConfig({
          ikeaIdentity: newIdentity,
          ikeaPreSharedKey: psk,
        });
      } catch (error) {
        this.log("error", `Error authenticating with gateway: ${error}`);
        return null;
      }
    }

    const newIdentity = globalConfig.ikeaIdentity;
    const newPreSharedKey = globalConfig.ikeaPreSharedKey;
    if (!newIdentity || !newPreSharedKey) {
      this.log("error", "No IKEA Tradfri identity or PSK");
      return null;
    }

    tradfriClient.connect(newIdentity, newPreSharedKey);
    return tradfriClient;
  }
}

export const tradfriPlugin = new TradfriPlugin();
