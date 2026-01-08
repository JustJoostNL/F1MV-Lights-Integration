import { BaseIntegrationPlugin } from "../BaseIntegrationPlugin";
import { getConfig, globalConfig } from "../../ipc/config";
import { ApiClient, createApiClient, buildBaseUrl } from "../utils/apiClient";
import { IntegrationApiError } from "../utils/error";
import {
  IntegrationPlugin,
  IntegrationControlArgs,
  IntegrationHealthStatus,
  ListDevicesResponse,
  ControlType,
} from "../../../shared/types/integration";
import {
  IHomebridgeAccessory,
  IHomebridgeAccessoryResponse,
  IHomebridgeAuthCheckResponse,
  IHomebridgeTokenResponse,
} from "../../../shared/types/homebridge";
import { rgbToHueSat } from "../utils/colorConversions";
import { IConfig } from "../../../shared/types/config";

let storedToken: { token: string; expiry: number } | null = null;

export class HomebridgePlugin extends BaseIntegrationPlugin {
  readonly id = IntegrationPlugin.HOMEBRIDGE;
  readonly name = "Homebridge";
  readonly enabledConfigKey = "homebridgeEnabled";
  readonly restartConfigKeys: (keyof IConfig)[] = [
    "homebridgeHost",
    "homebridgePort",
    "homebridgeUsername",
    "homebridgePassword",
  ];

  private validateConfiguration(): void {
    if (!globalConfig.homebridgeHost) {
      throw new IntegrationApiError("Homebridge host is not configured");
    }
    if (!globalConfig.homebridgeUsername || !globalConfig.homebridgePassword) {
      throw new IntegrationApiError(
        "Homebridge credentials are not configured",
      );
    }
  }

  private async getApiClient(): Promise<ApiClient> {
    const token = await this.requestToken();
    if (!token) {
      throw new IntegrationApiError(
        "Failed to obtain Homebridge authentication token",
      );
    }

    const baseUrl = buildBaseUrl(
      globalConfig.homebridgeHost,
      globalConfig.homebridgePort,
    );
    if (!baseUrl) {
      throw new IntegrationApiError("Failed to build Homebridge API URL");
    }

    return createApiClient({
      baseUrl,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 5000,
    });
  }

  async initialize(): Promise<void> {
    this.log("debug", "Initializing Homebridge...");
    await this.healthCheck();
    if (this._isOnline) {
      this.log("info", "Homebridge API is online");
    }
  }

  async healthCheck(): Promise<IntegrationHealthStatus> {
    try {
      this.validateConfiguration();
      const client = await this.getApiClient();
      const { data } =
        await client.get<IHomebridgeAuthCheckResponse>("/api/auth/check");
      const isOnline = data.status === "OK";
      this.setOnline(isOnline);
      if (!isOnline) {
        this.log(
          "warn",
          "Health check failed: Auth check returned non-OK status",
        );
      }
      return isOnline
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
    const config = await getConfig();
    const client = await this.getApiClient();
    const { data } =
      await client.get<IHomebridgeAccessoryResponse>("/api/accessories");

    return {
      devices: data
        .filter((item) => item.type === "Lightbulb" && this.supportsHSB(item))
        .map((item) => ({
          id: item.uniqueId,
          label: item.serviceName,
          state: item.values.On === 1,
        })),
      selectedDevices: config.homebridgeAccessories,
    };
  }

  async control(args: IntegrationControlArgs): Promise<void> {
    if (!this._isOnline) return;

    const { controlType, color, brightness } = args;
    const config = await getConfig();
    const client = await this.getApiClient();

    if (controlType === ControlType.ON) {
      const { hue, sat } = rgbToHueSat(color.r, color.g, color.b);
      const payloads = [
        { characteristicType: "On", value: 1 },
        { characteristicType: "Hue", value: Math.floor(hue) },
        { characteristicType: "Saturation", value: Math.floor(sat) },
        { characteristicType: "Brightness", value: brightness },
      ];

      await Promise.all(
        config.homebridgeAccessories.flatMap((uniqueId) =>
          payloads.map((payload) =>
            client.put(`/api/accessories/${uniqueId}`, payload),
          ),
        ),
      );
    } else {
      await Promise.all(
        config.homebridgeAccessories.map((uniqueId) =>
          client.put(`/api/accessories/${uniqueId}`, {
            characteristicType: "On",
            value: 0,
          }),
        ),
      );
    }
  }

  private async requestToken(): Promise<string | undefined> {
    if (storedToken && storedToken.expiry > Date.now()) {
      return storedToken.token;
    }

    this.validateConfiguration();
    const baseUrl = buildBaseUrl(
      globalConfig.homebridgeHost,
      globalConfig.homebridgePort,
    );
    if (!baseUrl) {
      throw new IntegrationApiError("Failed to build Homebridge login URL");
    }

    const loginClient = createApiClient({ baseUrl, timeout: 5000 });
    const { data } = await loginClient.post<IHomebridgeTokenResponse>(
      "/api/auth/login",
      {
        username: globalConfig.homebridgeUsername,
        password: globalConfig.homebridgePassword,
      },
    );

    if (!data.access_token) {
      throw new IntegrationApiError("No access token received from Homebridge");
    }

    storedToken = {
      token: data.access_token,
      expiry: Date.now() + data.expires_in * 1000,
    };
    return data.access_token;
  }

  private supportsHSB(accessory: IHomebridgeAccessory): boolean {
    return "Hue" in accessory.values && "Saturation" in accessory.values;
  }
}

export const homebridgePlugin = new HomebridgePlugin();
