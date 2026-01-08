import fetch from "cross-fetch";
import { BaseIntegrationPlugin } from "../BaseIntegrationPlugin";
import { getConfig, globalConfig } from "../../ipc/config";
import { fetchWithTimeout } from "../../utils/fetch";
import {
  IntegrationPlugin,
  IntegrationControlArgs,
  IntegrationHealthStatus,
  ListDevicesResponse,
  IntegrationUtilityFunction,
  ControlType,
} from "../../../shared/types/integration";
import {
  IHomeAssistantAPIPingResponse,
  IHomeAssistantStatesResponse,
  IHomeAssistantStateResponse,
} from "../../../shared/types/homeassistant";
import { rgbToColorTemp } from "../utils/colorConversions";

const requestHeaders = new Headers({
  "Content-Type": "application/json",
});

export class HomeAssistantPlugin extends BaseIntegrationPlugin {
  readonly id = IntegrationPlugin.HOME_ASSISTANT;
  readonly name = "Home Assistant";
  readonly enabledConfigKey = "homeAssistantEnabled";
  readonly restartConfigKeys = [];

  async initialize(): Promise<void> {
    this.log("debug", "Checking if the Home Assistant API is online...");

    const status = await this.healthCheck();
    if (status === "online") {
      this.log("debug", "Home Assistant API is online.");
    } else {
      this.log(
        "error",
        "Could not connect to the Home Assistant API, please make sure that the hostname and port are correct!",
      );
    }
  }

  async healthCheck(): Promise<IntegrationHealthStatus> {
    const url = new URL("/api/", globalConfig.homeAssistantHost);
    url.port = globalConfig.homeAssistantPort.toString();
    requestHeaders.set(
      "Authorization",
      "Bearer " + globalConfig.homeAssistantToken,
    );

    try {
      const res = await fetchWithTimeout(url.toString(), {
        headers: requestHeaders,
      });
      const data: IHomeAssistantAPIPingResponse = await res.json();
      this.setOnline(data.message === "API running.");
      return this._isOnline ? "online" : "offline";
    } catch (error) {
      this.setOnline(false);
      return "offline";
    }
  }

  async listDevices(): Promise<ListDevicesResponse> {
    const config = await getConfig();
    const url = new URL("/api/states", config.homeAssistantHost);
    url.port = config.homeAssistantPort.toString();
    requestHeaders.set("Authorization", "Bearer " + config.homeAssistantToken);

    try {
      const res = await fetch(url, { headers: requestHeaders });
      const json: IHomeAssistantStatesResponse[] = await res.json();

      const devices = json
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
        }));

      return {
        devices,
        selectedDevices: config.homeAssistantDevices,
      };
    } catch (error) {
      this.log("error", `Failed to list devices: ${error}`);
      return { devices: [], selectedDevices: [] };
    }
  }

  async control(args: IntegrationControlArgs): Promise<void> {
    if (!this._isOnline) return;

    const { controlType, color, brightness, event } = args;
    const config = await getConfig();
    const homeAssistantDevices = config.homeAssistantDevices;
    const adjustedBrightness = Math.round((brightness / 100) * 254);

    const onUrl = new URL(
      "/api/services/light/turn_on",
      config.homeAssistantHost,
    );
    onUrl.port = config.homeAssistantPort.toString();

    const offUrl = new URL(
      "/api/services/light/turn_off",
      config.homeAssistantHost,
    );
    offUrl.port = config.homeAssistantPort.toString();

    switch (controlType) {
      case ControlType.ON:
        for (const entityId of homeAssistantDevices) {
          const supportsRGB = await this.checkDeviceSpectrum(entityId);

          let colorTemp = 0;

          if (!supportsRGB) {
            const deviceList = await this.listDevices();
            const foundDevice = deviceList.devices.find(
              (item) => item.id === entityId,
            );
            const meta = foundDevice?.metadata as {
              min_mireds?: number;
              max_mireds?: number;
            };

            colorTemp = rgbToColorTemp(
              event,
              meta?.min_mireds || 0,
              meta?.max_mireds || 0,
            );
          }

          const payload = supportsRGB
            ? {
                entity_id: entityId,
                rgb_color: [color.r, color.g, color.b],
                brightness: adjustedBrightness,
              }
            : {
                entity_id: entityId,
                color_temp: colorTemp,
                brightness: adjustedBrightness,
              };

          try {
            await fetch(onUrl, {
              method: "POST",
              headers: requestHeaders,
              body: JSON.stringify(payload),
            });
          } catch (error) {
            this.log("error", `Error turning on device ${entityId}: ${error}`);
          }
        }
        break;

      case ControlType.OFF:
        for (const entityId of homeAssistantDevices) {
          const payload = { entity_id: entityId };

          try {
            await fetch(offUrl, {
              method: "POST",
              headers: requestHeaders,
              body: JSON.stringify(payload),
            });
          } catch (error) {
            this.log("error", `Error turning off device ${entityId}: ${error}`);
          }
        }
        break;
    }
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
    const url = new URL("/api/states/" + entityId, config.homeAssistantHost);
    url.port = config.homeAssistantPort.toString();
    requestHeaders.set("Authorization", "Bearer " + config.homeAssistantToken);

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: requestHeaders,
      });
      const data: IHomeAssistantStateResponse = await res.json();
      if (!data.attributes.supported_color_modes) return false;
      return !!data.attributes.supported_color_modes.find(
        (mode: string) =>
          mode === "rgb" || mode === "rgbw" || mode === "hs" || mode === "xy",
      );
    } catch (error) {
      this.log(
        "error",
        `Error checking if device ${entityId} supports spectrum: ${error}`,
      );
      return false;
    }
  }
}

export const homeAssistantPlugin = new HomeAssistantPlugin();
