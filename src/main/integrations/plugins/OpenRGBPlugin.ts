import Client from "openrgb-sdk";
import { BaseIntegrationPlugin } from "../BaseIntegrationPlugin";
import { globalConfig } from "../../ipc/config";
import { IntegrationApiError } from "../utils/error";
import {
  IntegrationPlugin,
  IntegrationControlArgs,
  ControlType,
} from "../../../shared/types/integration";
import { IConfig } from "../../../shared/types/config";

export class OpenRGBPlugin extends BaseIntegrationPlugin {
  readonly id = IntegrationPlugin.OPENRGB;
  readonly name = "OpenRGB";
  readonly enabledConfigKey = "openrgbEnabled";
  readonly restartConfigKeys: (keyof IConfig)[] = [
    "openrgbServerIp",
    "openrgbServerPort",
  ];

  private client: Client | undefined = undefined;
  private manualDisconnect = false;

  private validateConfiguration(): void {
    if (!globalConfig.openrgbServerIp) {
      throw new IntegrationApiError("OpenRGB server IP is not configured");
    }
    if (!globalConfig.openrgbServerPort) {
      throw new IntegrationApiError("OpenRGB server port is not configured");
    }
  }

  async initialize(): Promise<void> {
    this.validateConfiguration();
    this.log("debug", "Connecting to OpenRGB...");

    if (this._isOnline && this.client) {
      this.manualDisconnect = true;
      this.client.disconnect();
      this.client = undefined;
    }

    this.client = new Client(
      "F1MV Lights Integration",
      globalConfig.openrgbServerPort,
      globalConfig.openrgbServerIp,
    );

    try {
      await this.client.connect();
      this.setOnline(true);
      this.log("info", "Connected to OpenRGB");
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "Connection failed";
      this.log("warn", `Failed to connect to OpenRGB: ${reason}`);
      this.setOnline(false);
      throw new IntegrationApiError(`Failed to connect to OpenRGB: ${reason}`);
    }

    this.client.on("disconnect", () => {
      if (this.manualDisconnect) {
        this.manualDisconnect = false;
        return;
      }
      this.setOnline(false);
    });

    this.client.on("connect", () => this.setOnline(true));
  }

  async shutdown(): Promise<void> {
    this.manualDisconnect = true;
    this.client?.disconnect();
    this.client = undefined;
    await super.shutdown();
  }

  async control(args: IntegrationControlArgs): Promise<void> {
    if (!this._isOnline || !this.client) {
      throw new IntegrationApiError("OpenRGB is not connected");
    }

    const { controlType, color } = args;
    const deviceCount = await this.client.getControllerCount();
    this.log("debug", `Controlling ${deviceCount} OpenRGB devices`);

    const targetColor =
      controlType === ControlType.ON
        ? { red: color.r, green: color.g, blue: color.b }
        : { red: 0, green: 0, blue: 0 };

    for (let i = 0; i < deviceCount; i++) {
      const device = await this.client.getControllerData(i);
      const colors = Array(device.colors.length).fill(targetColor);
      this.client.updateLeds(i, colors);
    }
  }
}

export const openrgbPlugin = new OpenRGBPlugin();
