import {
  discoverGateway,
  DiscoveredGateway,
  TradfriClient,
} from "node-tradfri-client";
import { BaseIntegrationPlugin } from "../BaseIntegrationPlugin";
import { globalConfig, patchConfig } from "../../ipc/config";
import { IntegrationApiError } from "../utils/error";
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

  private validateConfiguration(): void {
    if (!globalConfig.ikeaGatewayIp) {
      throw new IntegrationApiError(
        "IKEA Tradfri gateway IP is not configured",
      );
    }
    if (!globalConfig.ikeaSecurityCode) {
      throw new IntegrationApiError(
        "IKEA Tradfri security code is not configured",
      );
    }
  }

  async initialize(): Promise<void> {
    this.log("debug", "Initializing IKEA Tradfri...");
    await this.healthCheck();
    if (this._isOnline) {
      this.log("info", "IKEA Tradfri gateway is online");
    }
  }

  async healthCheck(): Promise<IntegrationHealthStatus> {
    try {
      const client = await this.getClient();
      const ping = await client.ping();
      this.setOnline(ping);
      if (!ping) {
        this.log(
          "warn",
          "Health check failed: Gateway did not respond to ping",
        );
      }
      return ping
        ? IntegrationHealthStatus.ONLINE
        : IntegrationHealthStatus.OFFLINE;
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown error";
      this.log("warn", `Health check failed: ${reason}`);
      this.setOnline(false);
      return IntegrationHealthStatus.OFFLINE;
    }
  }

  async listDevices(): Promise<ListDevicesResponse> {
    const client = await this.getClient();
    await client.observeDevices();

    return {
      devices: Object.values(client.devices)
        .filter((device) => device.type === 2)
        .map((device) => ({
          id: device.instanceId,
          label: device.name,
          state: device.lightList[0]?.onOff,
          metadata: {
            type: device.type,
            spectrum: device.lightList[0]?.spectrum,
          },
        })),
      selectedDevices: globalConfig.ikeaDeviceIds,
    };
  }

  async control(args: IntegrationControlArgs): Promise<void> {
    if (!this._isOnline) return;

    const { controlType, color, brightness, event } = args;
    const client = await this.getClient();
    await client.observeDevices();

    const devices = Object.values(client.devices).filter(
      (device) =>
        device.type === 2 &&
        globalConfig.ikeaDeviceIds.includes(device.instanceId),
    );

    for (const device of devices) {
      const light = device.lightList[0];
      if (!light) continue;

      // @ts-ignore - link method exists
      light.link(client);

      if (controlType === ControlType.ON) {
        const { hue, sat } = rgbToHueSat(color.r, color.g, color.b);
        if (light.spectrum === "rgb") {
          light.toggle(true);
          light.setHue(hue);
          light.setSaturation(sat);
          light.setBrightness(brightness);
        } else {
          light.toggle(true);
          light.setColorTemperature(getTradfriColorTempFromEvent(event) ?? 370);
        }
      } else {
        light.toggle(false);
      }
    }
  }

  getUtilityFunctions(): IntegrationUtilityFunction[] {
    return [
      {
        name: "discoverGateway",
        handler: async () => this.discoverGateway(),
      },
    ];
  }

  private async discoverGateway(): Promise<DiscoveredGateway | null> {
    const gateway = await discoverGateway();
    if (gateway)
      this.log("debug", `Discovered Tradfri gateway at ${gateway.host}`);
    return gateway;
  }

  private async getClient(): Promise<TradfriClient> {
    this.validateConfiguration();

    const tradfriClient = new TradfriClient(globalConfig.ikeaGatewayIp!, {
      watchConnection: true,
    });

    // Authenticate if needed
    if (!globalConfig.ikeaIdentity || !globalConfig.ikeaPreSharedKey) {
      const { identity, psk } = await tradfriClient.authenticate(
        globalConfig.ikeaSecurityCode!,
      );
      if (!identity || !psk) {
        throw new IntegrationApiError(
          "Failed to authenticate with Tradfri gateway",
        );
      }
      await patchConfig({ ikeaIdentity: identity, ikeaPreSharedKey: psk });
    }

    await tradfriClient.connect(
      globalConfig.ikeaIdentity!,
      globalConfig.ikeaPreSharedKey!,
    );
    return tradfriClient;
  }
}

export const tradfriPlugin = new TradfriPlugin();
