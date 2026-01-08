import Client from "openrgb-sdk";
import { BaseIntegrationPlugin } from "../BaseIntegrationPlugin";
import { globalConfig } from "../../ipc/config";
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

  async initialize(): Promise<void> {
    try {
      if (this._isOnline) {
        this.manualDisconnect = true;
        this.log("debug", "Already connected, closing current connection...");
        this.client?.disconnect();
        this.client = undefined;
      } else {
        this.log("debug", "Connecting to OpenRGB...");
      }

      this.client = new Client(
        "F1MV Lights Integration",
        globalConfig.openrgbServerPort,
        globalConfig.openrgbServerIp,
      );

      await this.client.connect();
      this.setOnline(true);

      this.client.on("disconnect", () => {
        if (this.manualDisconnect) {
          this.manualDisconnect = false;
          return;
        }
        this.setOnline(false);
        this.log(
          "error",
          "Disconnected from OpenRGB, please make sure the SDK server is running.",
        );
      });

      this.client.on("connect", () => {
        this.setOnline(true);
      });
    } catch (error) {
      this.setOnline(false);
      this.log(
        "error",
        "Could not connect to OpenRGB, please make sure the SDK server is running.",
      );
    }
  }

  async shutdown(): Promise<void> {
    this.manualDisconnect = true;
    this.client?.disconnect();
    this.client = undefined;
    await super.shutdown();
  }

  async control(args: IntegrationControlArgs): Promise<void> {
    if (!this._isOnline || !this.client) {
      this.log("error", "OpenRGB is not connected!");
      return;
    }

    const { controlType, color } = args;
    const deviceCount = await this.client.getControllerCount();
    this.log("debug", `OpenRGB has ${deviceCount} devices`);

    switch (controlType) {
      case ControlType.ON:
        for (let i = 0; i < deviceCount; i++) {
          const device = await this.client.getControllerData(i);
          const colors = Array(device.colors.length).fill({
            red: color.r,
            green: color.g,
            blue: color.b,
          });
          this.client.updateLeds(i, colors);
          this.log("debug", `Updated OpenRGB device ${device.deviceId} to on.`);
        }
        break;

      case ControlType.OFF:
        for (let i = 0; i < deviceCount; i++) {
          const device = await this.client.getControllerData(i);
          const colors = Array(device.colors.length).fill({
            red: 0,
            green: 0,
            blue: 0,
          });
          this.client.updateLeds(i, colors);
          this.log(
            "debug",
            `Updated OpenRGB device ${device.deviceId} to off.`,
          );
        }
        break;
    }
  }
}

export const openrgbPlugin = new OpenRGBPlugin();
