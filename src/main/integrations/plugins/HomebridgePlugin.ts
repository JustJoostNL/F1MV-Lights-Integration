import fetch from "cross-fetch";
import { BaseIntegrationPlugin } from "../BaseIntegrationPlugin";
import { getConfig, globalConfig } from "../../ipc/config";
import { fetchWithTimeout } from "../../utils/fetch";
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

  async initialize(): Promise<void> {
    this.log("debug", "Checking if the Homebridge API is online...");

    const status = await this.healthCheck();
    if (status === "online") {
      this.log("debug", "Homebridge API is online.");
    } else {
      this.log(
        "error",
        "Could not connect to the Homebridge API, please make sure that the hostname and port are correct!",
      );
    }
  }

  async healthCheck(): Promise<IntegrationHealthStatus> {
    const url = new URL("/api/auth/check", globalConfig.homebridgeHost);
    url.port = globalConfig.homebridgePort.toString();

    const token = await this.requestToken();
    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    });

    try {
      const res = await fetchWithTimeout(url.toString(), { headers });
      const data: IHomebridgeAuthCheckResponse = await res.json();

      const isOnline = data.status === "OK";
      this.setOnline(isOnline);
      return isOnline ? "online" : "offline";
    } catch (error) {
      this.setOnline(false);
      return "offline";
    }
  }

  async listDevices(): Promise<ListDevicesResponse> {
    const config = await getConfig();
    const url = new URL("/api/accessories", config.homebridgeHost);
    url.port = config.homebridgePort.toString();

    const token = await this.requestToken();
    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    });

    try {
      const res = await fetch(url.toString(), { headers });
      const json: IHomebridgeAccessoryResponse = await res.json();

      const devices = json
        .filter((item) => item.type === "Lightbulb" && this.supportsHSB(item))
        .map((item) => ({
          id: item.uniqueId,
          label: item.serviceName,
          state: item.values.On === 1,
        }));

      return {
        devices,
        selectedDevices: config.homebridgeAccessories,
      };
    } catch (error) {
      this.log("error", `Failed to list devices: ${error}`);
      return { devices: [], selectedDevices: [] };
    }
  }

  async control(args: IntegrationControlArgs): Promise<void> {
    if (!this._isOnline) return;

    const { controlType, color, brightness } = args;
    const config = await getConfig();
    const token = await this.requestToken();
    const homebridgeAccessories = config.homebridgeAccessories;

    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    });

    switch (controlType) {
      case ControlType.ON:
        for (const uniqueId of homebridgeAccessories) {
          const url = new URL(
            "/api/accessories/" + uniqueId,
            config.homebridgeHost,
          );
          url.port = config.homebridgePort.toString();

          const { hue, sat } = rgbToHueSat(color.r, color.g, color.b);

          const payloads = [
            { characteristicType: "On", value: 1 },
            { characteristicType: "Hue", value: Math.floor(hue) },
            { characteristicType: "Saturation", value: Math.floor(sat) },
            { characteristicType: "Brightness", value: brightness },
          ];

          for (const payload of payloads) {
            try {
              await fetch(url.toString(), {
                method: "PUT",
                headers,
                body: JSON.stringify(payload),
              });
            } catch (error) {
              this.log(
                "error",
                `Error setting ${payload.characteristicType} on ${uniqueId}: ${error}`,
              );
            }
          }
        }
        break;

      case ControlType.OFF:
        for (const uniqueId of homebridgeAccessories) {
          const url = new URL(
            "/api/accessories/" + uniqueId,
            config.homebridgeHost,
          );
          url.port = config.homebridgePort.toString();

          try {
            await fetch(url.toString(), {
              method: "PUT",
              headers,
              body: JSON.stringify({ characteristicType: "On", value: 0 }),
            });
          } catch (error) {
            this.log("error", `Error turning off ${uniqueId}: ${error}`);
          }
        }
        break;
    }
  }

  private async requestToken(): Promise<string | undefined> {
    if (storedToken && storedToken.expiry > Date.now()) {
      return storedToken.token;
    }

    const url = new URL("/api/auth/login", globalConfig.homebridgeHost);
    url.port = globalConfig.homebridgePort.toString();

    try {
      const res = await fetchWithTimeout(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: globalConfig.homebridgeUsername,
          password: globalConfig.homebridgePassword,
        }),
      });
      const data: IHomebridgeTokenResponse = await res.json();

      storedToken = {
        token: data.access_token,
        expiry: Date.now() + data.expires_in * 1000,
      };

      return data.access_token;
    } catch (error) {
      this.log("error", `Error requesting token: ${error}`);
      return undefined;
    }
  }

  private supportsHSB(accessory: IHomebridgeAccessory): boolean {
    return "Hue" in accessory.values && "Saturation" in accessory.values;
  }
}

export const homebridgePlugin = new HomebridgePlugin();
