import { createDirigeraClient } from "dirigera";
import { IConfig } from "../../../shared/types/config";
import {
  IntegrationPlugin,
  IntegrationControlArgs,
  IntegrationHealthStatus,
  ListDevicesResponse,
  IntegrationUtilityFunction,
  ControlType,
} from "../../../shared/types/integration";
import { BaseIntegrationPlugin } from "../BaseIntegrationPlugin";
import { globalConfig } from "../../ipc/config";
import { IntegrationApiError } from "../utils/error";
import { calculateColorTemperature } from "../utils/colorConversions";

export class DirigeraPlugin extends BaseIntegrationPlugin {
  readonly id = IntegrationPlugin.DIRIGERA;
  readonly name = "IKEA Dirigera";
  readonly enabledConfigKey = "dirigeraEnabled";
  readonly restartConfigKeys: (keyof IConfig)[] = [
    "dirigeraHubIp",
    "dirigeraAccessToken",
  ];

  private cachedClient: Awaited<
    ReturnType<typeof createDirigeraClient>
  > | null = null;

  private validateConfiguration(): void {
    if (!globalConfig.dirigeraAccessToken) {
      throw new IntegrationApiError("Dirigera access token is not configured");
    }
  }

  private async getClient() {
    this.validateConfiguration();

    const hubIp = globalConfig.dirigeraHubIp;
    if (!hubIp) {
      throw new IntegrationApiError("Dirigera hub IP is not configured");
    }

    if (this.cachedClient) return this.cachedClient;

    this.cachedClient = await createDirigeraClient({
      accessToken: globalConfig.dirigeraAccessToken!,
      gatewayIP: hubIp,
    });

    return this.cachedClient;
  }

  async initialize(): Promise<void> {
    await this.healthCheck();
    if (this._isOnline) {
      this.log("info", "IKEA Dirigera hub is online");
    }
  }

  async shutdown(): Promise<void> {
    this.cachedClient = null;
    await super.shutdown();
  }

  async healthCheck(): Promise<IntegrationHealthStatus> {
    try {
      const client = await this.getClient();
      await client.hub.status();
      this.setOnline(true);
      this.log("debug", "Hub status check successful");
      return IntegrationHealthStatus.ONLINE;
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown error";
      this.log("warn", `Health check failed: ${reason}`);
      this.setOnline(false);
      return IntegrationHealthStatus.OFFLINE;
    }
  }

  async listDevices(): Promise<ListDevicesResponse> {
    const client = await this.getClient();
    const lights = await client.lights.list();

    return {
      devices: lights.map((light) => ({
        id: light.id,
        label: light.attributes.customName,
        state: light.attributes.isOn,
        metadata: {
          type: light.type,
          deviceType: light.deviceType,
        },
      })),
      selectedDevices: globalConfig.dirigeraDeviceIds,
    };
  }

  async control(args: IntegrationControlArgs): Promise<void> {
    if (!this._isOnline) return;

    const { controlType, color, brightness } = args;
    const client = await this.getClient();

    const shouldFade = globalConfig.dirigeraFadeEnabled;

    await Promise.allSettled(
      globalConfig.dirigeraDeviceIds.map(async (deviceId) => {
        try {
          if (controlType === ControlType.ON) {
            const { hue, saturation } = this.rgbToHueSat(
              color.r,
              color.g,
              color.b,
            );

            const state = await client.lights.get({ id: deviceId });
            const supportsColor = state.attributes.colorMode === "color";
            const supportsTemp = state.attributes.colorMode === "temperature";

            if (!state.attributes.isOn) {
              await client.lights.setIsOn({
                id: deviceId,
                isOn: true,
              });
            }

            if (supportsColor) {
              await client.lights.setLightColor({
                id: deviceId,
                colorHue: Math.round(hue),
                colorSaturation: saturation,
                ...(!shouldFade && { transitionTime: 0 }),
              });
            } else if (
              supportsTemp &&
              state.attributes.colorTemperatureMin &&
              state.attributes.colorTemperatureMax
            ) {
              await client.lights.setLightTemperature({
                id: deviceId,
                colorTemperature: calculateColorTemperature(
                  color,
                  state.attributes.colorTemperatureMin,
                  state.attributes.colorTemperatureMax,
                ),
                ...(!shouldFade && { transitionTime: 0 }),
              });
            }
            await client.lights.setLightLevel({
              id: deviceId,
              lightLevel: brightness,
              ...(!shouldFade && { transitionTime: 0 }),
            });
          } else {
            await client.lights.setIsOn({
              id: deviceId,
              isOn: false,
            });
          }
        } catch (error) {
          this.log(
            "error",
            `Failed to control device ${deviceId}: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }),
    );
  }

  getUtilityFunctions(): IntegrationUtilityFunction[] {
    return [
      {
        name: "authenticate",
        description: "Authenticate with Dirigera hub (press action button)",
        handler: async () => this.authenticate(),
      },
    ];
  }

  private async authenticate(): Promise<{ accessToken: string } | null> {
    try {
      const hubIp = globalConfig.dirigeraHubIp;

      if (!hubIp) {
        throw new IntegrationApiError("Dirigera hub IP is not configured");
      }

      const client = await createDirigeraClient({ gatewayIP: hubIp });

      const accessToken = await client.authenticate();

      if (accessToken) {
        this.log("info", "Authentication successful");
        return { accessToken };
      }

      this.log("error", "Authentication failed - no access token received");
      return null;
    } catch (error) {
      this.log(
        "error",
        `Authentication error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return null;
    }
  }

  private rgbToHueSat(
    r: number,
    g: number,
    b: number,
  ): { hue: number; saturation: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    let s = 0;

    if (delta !== 0) {
      s = delta / max;

      if (max === r) {
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
      } else if (max === g) {
        h = ((b - r) / delta + 2) / 6;
      } else {
        h = ((r - g) / delta + 4) / 6;
      }
    }

    return { hue: h * 360, saturation: s };
  }
}

export const dirigeraPlugin = new DirigeraPlugin();
