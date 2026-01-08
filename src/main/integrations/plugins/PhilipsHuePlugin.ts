import fetch from "cross-fetch";
import converter from "@q42philips/hue-color-converter";
import { BaseIntegrationPlugin } from "../BaseIntegrationPlugin";
import { globalConfig } from "../../ipc/config";
import {
  fetchWithoutSSLCheck,
  fetchWithoutSSLCheckWithTimeout,
} from "../../utils/fetch";
import {
  IntegrationPlugin,
  IntegrationControlArgs,
  IntegrationHealthStatus,
  ListDevicesResponse,
  IntegrationUtilityFunction,
  ControlType,
} from "../../../shared/types/integration";
import {
  HueGenerateAuthTokenResponse,
  DiscoverPhilipsHueBridgeResponse,
  DiscoveryStatus,
  GeneratePhilipsHueBridgeAuthTokenResponse,
  GenerationStatus,
  HueDiscoveryResponse,
  IHueClipLightResponse,
  IHueApiGroupResponse,
} from "../../../shared/types/philipshue";
import { IConfig } from "../../../shared/types/config";

export class PhilipsHuePlugin extends BaseIntegrationPlugin {
  readonly id = IntegrationPlugin.PHILIPSHUE;
  readonly name = "Philips Hue";
  readonly enabledConfigKey = "philipsHueEnabled";
  readonly restartConfigKeys: (keyof IConfig)[] = [
    "philipsHueBridgeIP",
    "philipsHueBridgeAuthToken",
  ];

  async initialize(): Promise<void> {
    const status = await this.healthCheck();
    if (status === "online") {
      this.log("debug", "Philips Hue API is online.");
    } else {
      this.log(
        "error",
        "Could not connect to the Philips Hue API, please make sure that the IP and token are correct!",
      );
    }
  }

  async healthCheck(): Promise<IntegrationHealthStatus> {
    const headers = new Headers();
    globalConfig.philipsHueBridgeAuthToken &&
      headers.set(
        "hue-application-key",
        globalConfig.philipsHueBridgeAuthToken,
      );

    try {
      const res = await fetchWithoutSSLCheckWithTimeout(
        `https://${globalConfig.philipsHueBridgeIP}/clip/v2/resource/bridge`,
        { headers },
      );

      this.setOnline(res.status === 200);
      return res.status === 200 ? "online" : "offline";
    } catch (error) {
      this.setOnline(false);
      return "offline";
    }
  }

  async listDevices(): Promise<ListDevicesResponse> {
    const headers = new Headers();
    globalConfig.philipsHueBridgeAuthToken &&
      headers.set(
        "hue-application-key",
        globalConfig.philipsHueBridgeAuthToken,
      );

    try {
      const res = await fetchWithoutSSLCheck(
        `https://${globalConfig.philipsHueBridgeIP}/clip/v2/resource/light`,
        { headers },
      );
      const json: IHueClipLightResponse = await res.json();

      const devices = json.data.map((device) => ({
        id: device.id,
        label: device.metadata.name,
        state: device.on.on,
      }));

      return {
        devices,
        selectedDevices: globalConfig.philipsHueDeviceIds,
      };
    } catch (error) {
      this.log("error", `Failed to list devices: ${error}`);
      return { devices: [], selectedDevices: [] };
    }
  }

  async control(args: IntegrationControlArgs): Promise<void> {
    if (!this._isOnline) return;

    const { controlType, color, brightness, eventAction } = args;

    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    globalConfig.philipsHueBridgeAuthToken &&
      headers.set(
        "hue-application-key",
        globalConfig.philipsHueBridgeAuthToken,
      );

    const shouldFade =
      eventAction && eventAction.philipsHueEnableFade !== undefined
        ? eventAction.philipsHueEnableFade
        : globalConfig.philipsHueEnableFade;

    // Control individual devices
    for (const deviceId of globalConfig.philipsHueDeviceIds) {
      const url = new URL(
        `https://${globalConfig.philipsHueBridgeIP}/clip/v2/resource/light/${deviceId}`,
      );

      const xy: number[] = converter.calculateXY(color.r, color.g, color.b);

      const body = {
        on: { on: controlType === ControlType.ON },
        dimming: { brightness },
        color: { xy: { x: xy[0], y: xy[1] } },
        ...(!shouldFade && { dynamics: { duration: 0 } }),
      };

      try {
        await fetchWithoutSSLCheck(url.toString(), {
          method: "PUT",
          headers,
          body: JSON.stringify(body),
        });
      } catch (error) {
        this.log("error", `Error controlling device ${deviceId}: ${error}`);
      }
    }

    // Control groups
    for (const groupId of globalConfig.philipsHueGroupIds) {
      const url = new URL(
        `https://${globalConfig.philipsHueBridgeIP}/api/${globalConfig.philipsHueBridgeAuthToken}/groups/${groupId}/action`,
      );
      const xy: number[] = converter.calculateXY(color.r, color.g, color.b);

      const body = {
        on: controlType === ControlType.ON,
        xy,
        bri: Math.round((brightness / 100) * 254),
        effect: "none",
        transitiontime: shouldFade ? undefined : 0,
      };

      try {
        await fetchWithoutSSLCheck(url.toString(), {
          method: "PUT",
          headers,
          body: JSON.stringify(body),
        });
      } catch (error) {
        this.log("error", `Error controlling group ${groupId}: ${error}`);
      }
    }
  }

  getUtilityFunctions(): IntegrationUtilityFunction[] {
    return [
      {
        name: "discoverBridge",
        description: "Discover Philips Hue bridges on the network",
        handler: async () => this.discoverBridge(),
      },
      {
        name: "generateAuthToken",
        description: "Generate authentication token for bridge",
        handler: async () => this.generateAuthToken(),
      },
      {
        name: "getGroups",
        description: "Get all Philips Hue groups",
        handler: async () => this.getGroups(),
      },
    ];
  }

  private async discoverBridge(): Promise<DiscoverPhilipsHueBridgeResponse> {
    try {
      const res = await fetch("https://discovery.meethue.com");
      const json: HueDiscoveryResponse =
        res.status === 200 ? await res.json() : [];
      return {
        status:
          res.status === 429
            ? DiscoveryStatus.RATE_LIMIT
            : json.length > 0
              ? DiscoveryStatus.SUCCESS
              : res.status === 200
                ? DiscoveryStatus.NO_BRIDGE_FOUND
                : DiscoveryStatus.ERROR,
        ipAddresses: json.map((device) => device.internalipaddress),
      };
    } catch (error) {
      return { status: DiscoveryStatus.ERROR, ipAddresses: [] };
    }
  }

  private async generateAuthToken(): Promise<GeneratePhilipsHueBridgeAuthTokenResponse> {
    try {
      const res = await fetch(`http://${globalConfig.philipsHueBridgeIP}/api`, {
        method: "POST",
        body: JSON.stringify({
          devicetype: "f1mvlightsintegration#app",
          generateclientkey: true,
        }),
      });

      const json: HueGenerateAuthTokenResponse = await res.json();
      return {
        status:
          json[0].error?.type === 101
            ? GenerationStatus.LINK_BUTTON_NOT_PRESSED
            : json[0].success?.username
              ? GenerationStatus.SUCCESS
              : GenerationStatus.ERROR,
        username: json[0].success?.username,
      };
    } catch (error) {
      return { status: GenerationStatus.ERROR, username: undefined };
    }
  }

  private async getGroups(): Promise<{
    groups: { id: string; name: string; state: boolean }[];
    selectedGroups: string[];
  }> {
    try {
      const res = await fetch(
        `http://${globalConfig.philipsHueBridgeIP}/api/${globalConfig.philipsHueBridgeAuthToken}/groups`,
      );
      const json: IHueApiGroupResponse = await res.json();

      const groups = Object.entries(json).map(([id, group]) => ({
        id,
        name: group.name,
        state: group.state.all_on,
      }));

      return {
        groups,
        selectedGroups: globalConfig.philipsHueGroupIds,
      };
    } catch (error) {
      this.log("error", `Failed to get groups: ${error}`);
      return { groups: [], selectedGroups: [] };
    }
  }
}

export const philipsHuePlugin = new PhilipsHuePlugin();
