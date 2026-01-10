import { BaseIntegrationPlugin } from "../BaseIntegrationPlugin";
import { getConfig, globalConfig } from "../../ipc/config";
import { ApiClient, createApiClient, buildBaseUrl } from "../utils/apiClient";
import { IntegrationApiError } from "../utils/error";
import {
  IntegrationPlugin,
  IntegrationControlArgs,
  IntegrationHealthStatus,
  ListDevicesResponse,
  IntegrationUtilityFunction,
  ControlType,
} from "../../../shared/types/integration";
import { EventType } from "../../../shared/types/config";
import {
  IHomeAssistantAPIPingResponse,
  IHomeAssistantStatesResponse,
  IHomeAssistantStateResponse,
} from "../../../shared/types/homeassistant";
import { rgbToColorTemp } from "../utils/colorConversions";

export class HomeAssistantPlugin extends BaseIntegrationPlugin {
  readonly id = IntegrationPlugin.HOME_ASSISTANT;
  readonly name = "Home Assistant";
  readonly enabledConfigKey = "homeAssistantEnabled";
  readonly restartConfigKeys = [];

  private getApiClient(): ApiClient {
    if (!globalConfig.homeAssistantHost) {
      throw new IntegrationApiError("Home Assistant host is not configured");
    }
    if (!globalConfig.homeAssistantToken) {
      throw new IntegrationApiError(
        "Home Assistant access token is not configured",
      );
    }

    const baseUrl = buildBaseUrl(
      globalConfig.homeAssistantHost,
      globalConfig.homeAssistantPort,
    );
    if (!baseUrl) {
      throw new IntegrationApiError("Failed to build Home Assistant API URL");
    }

    return createApiClient({
      baseUrl,
      headers: {
        Authorization: `Bearer ${globalConfig.homeAssistantToken}`,
        "Content-Type": "application/json",
      },
      timeout: 5000,
    });
  }

  async initialize(): Promise<void> {
    this.log("debug", "Initializing Home Assistant...");
    await this.healthCheck();
    if (this._isOnline) {
      this.log("info", "Home Assistant API is online");
    }
  }

  async healthCheck(): Promise<IntegrationHealthStatus> {
    try {
      const client = this.getApiClient();
      const { data } = await client.get<IHomeAssistantAPIPingResponse>("/api/");
      const isOnline = data.message === "API running.";
      this.setOnline(isOnline);
      if (!isOnline) {
        this.log(
          "warn",
          "Health check failed: API response was not 'API running.'",
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
    const baseUrl = buildBaseUrl(
      config.homeAssistantHost,
      config.homeAssistantPort,
    );
    if (!baseUrl || !config.homeAssistantToken) {
      throw new IntegrationApiError(
        "Home Assistant is not properly configured",
      );
    }

    const client = createApiClient({
      baseUrl,
      headers: {
        Authorization: `Bearer ${config.homeAssistantToken}`,
        "Content-Type": "application/json",
      },
    });

    const { data } =
      await client.get<IHomeAssistantStatesResponse[]>("/api/states");

    return {
      devices: data
        .filter((item) => item.entity_id.startsWith("light."))
        .map((item) => ({
          id: item.entity_id,
          label: item.attributes.friendly_name || item.entity_id,
          state: item.state === "on",
          metadata: {
            supported_color_modes: item.attributes.supported_color_modes,
            min_mireds: item.attributes.min_mireds,
            max_mireds: item.attributes.max_mireds,
          },
        })),
      selectedDevices: config.homeAssistantDevices,
    };
  }

  async control(args: IntegrationControlArgs): Promise<void> {
    if (!this._isOnline) return;

    const { controlType, color, brightness, event } = args;
    const config = await getConfig();
    const client = this.getApiClient();
    const adjustedBrightness = Math.round((brightness / 100) * 254);

    if (controlType === ControlType.ON) {
      await Promise.allSettled(
        config.homeAssistantDevices.map(async (entityId) => {
          const supportsRGB = await this.checkDeviceSpectrum(entityId);
          const payload = supportsRGB
            ? {
                entity_id: entityId,
                rgb_color: [color.r, color.g, color.b],
                brightness: adjustedBrightness,
              }
            : {
                entity_id: entityId,
                color_temp: await this.getColorTemp(entityId, event),
                brightness: adjustedBrightness,
              };
          await client.post("/api/services/light/turn_on", payload);
        }),
      );
    } else {
      await Promise.allSettled(
        config.homeAssistantDevices.map((entityId) =>
          client.post("/api/services/light/turn_off", { entity_id: entityId }),
        ),
      );
    }
  }

  private async getColorTemp(
    entityId: string,
    event: EventType,
  ): Promise<number> {
    const deviceList = await this.listDevices();
    const device = deviceList.devices.find((d) => d.id === entityId);
    const meta = device?.metadata as
      | { min_mireds?: number; max_mireds?: number }
      | undefined;
    return rgbToColorTemp(event, meta?.min_mireds || 0, meta?.max_mireds || 0);
  }

  getUtilityFunctions(): IntegrationUtilityFunction[] {
    return [
      {
        name: "checkDeviceSpectrum",
        description: "Check if a device supports RGB color",
        handler: async (entityId?: unknown) => {
          if (typeof entityId !== "string") return false;
          return this.checkDeviceSpectrum(entityId);
        },
      },
    ];
  }

  private async checkDeviceSpectrum(entityId: string): Promise<boolean> {
    const config = await getConfig();
    const baseUrl = buildBaseUrl(
      config.homeAssistantHost,
      config.homeAssistantPort,
    );
    if (!baseUrl || !config.homeAssistantToken) return false;

    const client = createApiClient({
      baseUrl,
      headers: {
        Authorization: `Bearer ${config.homeAssistantToken}`,
        "Content-Type": "application/json",
      },
    });

    const { data } = await client.get<IHomeAssistantStateResponse>(
      `/api/states/${entityId}`,
    );
    const modes = data.attributes?.supported_color_modes;
    if (!modes) return false;
    return modes.some((m: string) => ["rgb", "rgbw", "hs", "xy"].includes(m));
  }
}

export const homeAssistantPlugin = new HomeAssistantPlugin();
