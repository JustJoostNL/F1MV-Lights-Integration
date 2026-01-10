import converter from "@q42philips/hue-color-converter";
import { BaseIntegrationPlugin } from "../BaseIntegrationPlugin";
import { globalConfig } from "../../ipc/config";
import { ApiClient, createApiClient } from "../utils/apiClient";
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

  private discoveryClient = createApiClient({
    baseUrl: "https://discovery.meethue.com",
    timeout: 10000,
  });

  private validateConfiguration(): void {
    if (!globalConfig.philipsHueBridgeIP) {
      throw new IntegrationApiError("Philips Hue Bridge IP is not configured");
    }
    if (!globalConfig.philipsHueBridgeAuthToken) {
      throw new IntegrationApiError(
        "Philips Hue authentication token is not configured",
      );
    }
  }

  private getApiClient(useAuthHeader: boolean = true): ApiClient {
    this.validateConfiguration();
    return createApiClient({
      baseUrl: `https://${globalConfig.philipsHueBridgeIP}`,
      ...(useAuthHeader && {
        headers: {
          "hue-application-key": globalConfig.philipsHueBridgeAuthToken!,
        },
      }),
      skipSSLVerification: true,
      timeout: 2000,
    });
  }

  async initialize(): Promise<void> {
    this.log("debug", "Initializing Philips Hue...");
    await this.healthCheck();
    if (this._isOnline) {
      this.log("info", "Philips Hue API is online");
    }
  }

  async healthCheck(): Promise<IntegrationHealthStatus> {
    try {
      const client = this.getApiClient();
      await client.get("/clip/v2/resource/bridge");
      this.setOnline(true);
      return IntegrationHealthStatus.ONLINE;
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown error";
      this.log("warn", `Health check failed: ${reason}`);
      this.setOnline(false);
      return IntegrationHealthStatus.OFFLINE;
    }
  }

  async listDevices(): Promise<ListDevicesResponse> {
    const client = this.getApiClient();
    const { data } = await client.get<IHueClipLightResponse>(
      "/clip/v2/resource/light",
    );

    return {
      devices: data.data.map((device) => ({
        id: device.id,
        label: device.metadata.name,
        state: device.on.on,
      })),
      selectedDevices: globalConfig.philipsHueDeviceIds,
    };
  }

  async control(args: IntegrationControlArgs): Promise<void> {
    if (!this._isOnline) return;

    const { controlType, color, brightness, eventAction } = args;
    const client = this.getApiClient();
    const shouldFade =
      eventAction?.philipsHueEnableFade ?? globalConfig.philipsHueEnableFade;

    const xy = converter.calculateXY(color.r, color.g, color.b);
    const body = {
      on: { on: controlType === ControlType.ON },
      dimming: { brightness },
      color: { xy: { x: xy[0], y: xy[1] } },
      ...(!shouldFade && { dynamics: { duration: 0 } }),
    };

    await Promise.all(
      globalConfig.philipsHueDeviceIds.map((deviceId) =>
        client.put(`/clip/v2/resource/light/${deviceId}`, body),
      ),
    );

    if (globalConfig.philipsHueGroupIds.length > 0) {
      const legacyClient = this.getApiClient(false);
      const groupBody = {
        on: controlType === ControlType.ON,
        xy,
        bri: Math.round((brightness / 100) * 254),
        effect: "none",
        transitiontime: shouldFade ? undefined : 0,
      };

      await Promise.all(
        globalConfig.philipsHueGroupIds.map((groupId) =>
          legacyClient.put(
            `/api/${globalConfig.philipsHueBridgeAuthToken}/groups/${groupId}/action`,
            groupBody,
          ),
        ),
      );
    }
  }

  getUtilityFunctions(): IntegrationUtilityFunction[] {
    return [
      {
        name: "discoverBridge",
        handler: async () => this.discoverBridge(),
      },
      {
        name: "generateAuthToken",
        handler: async () => this.generateAuthToken(),
      },
      {
        name: "getGroups",
        handler: async () => this.getGroups(),
      },
    ];
  }

  private async discoverBridge(): Promise<DiscoverPhilipsHueBridgeResponse> {
    const { response, data } =
      await this.discoveryClient.get<HueDiscoveryResponse>("/");

    if (response.status === 429) {
      return { status: DiscoveryStatus.RATE_LIMIT, ipAddresses: [] };
    }
    if (!Array.isArray(data) || data.length === 0) {
      return { status: DiscoveryStatus.NO_BRIDGE_FOUND, ipAddresses: [] };
    }
    return {
      status: DiscoveryStatus.SUCCESS,
      ipAddresses: data.map((device) => device.internalipaddress),
    };
  }

  private async generateAuthToken(): Promise<GeneratePhilipsHueBridgeAuthTokenResponse> {
    if (!globalConfig.philipsHueBridgeIP) {
      return { status: GenerationStatus.ERROR, username: undefined };
    }

    const client = createApiClient({
      baseUrl: `https://${globalConfig.philipsHueBridgeIP}`,
      skipSSLVerification: true,
      timeout: 2000,
    });

    const { data } = await client.post<HueGenerateAuthTokenResponse>("/api", {
      devicetype: "f1mvlightsintegration#app",
      generateclientkey: true,
    });

    if (data[0]?.error?.type === 101) {
      return {
        status: GenerationStatus.LINK_BUTTON_NOT_PRESSED,
        username: undefined,
      };
    }
    if (data[0]?.success?.username) {
      return {
        status: GenerationStatus.SUCCESS,
        username: data[0].success.username,
      };
    }
    return { status: GenerationStatus.ERROR, username: undefined };
  }

  private async getGroups(): Promise<{
    groups: { id: string; name: string; state: boolean }[];
    selectedGroups: string[];
  }> {
    const client = this.getApiClient(false);
    const { data } = await client.get<IHueApiGroupResponse>(
      `/api/${globalConfig.philipsHueBridgeAuthToken}/groups`,
    );

    return {
      groups: Object.entries(data).map(([id, group]) => ({
        id,
        name: group.name,
        state: group.state.all_on,
      })),
      selectedGroups: globalConfig.philipsHueGroupIds,
    };
  }
}

export const philipsHuePlugin = new PhilipsHuePlugin();
