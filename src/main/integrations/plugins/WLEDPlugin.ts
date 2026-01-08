import { WLEDClient } from "wled-client";
import { BaseIntegrationPlugin } from "../BaseIntegrationPlugin";
import { globalConfig } from "../../ipc/config";
import {
  IntegrationPlugin,
  IntegrationControlArgs,
  IntegrationHealthStatus,
  ListDevicesResponse,
  ControlType,
} from "../../../shared/types/integration";

export class WLEDPlugin extends BaseIntegrationPlugin {
  readonly id = IntegrationPlugin.WLED;
  readonly name = "WLED";
  readonly enabledConfigKey = "wledEnabled";
  readonly restartConfigKeys = [];

  async initialize(): Promise<void> {
    const wledDevices = globalConfig.wledDevices;
    let successCount = 0;

    for (const ip of wledDevices) {
      try {
        const device = new WLEDClient(ip);
        await device.connect();
        successCount++;
        device.disconnect();
        this.log("debug", `Successfully initialized WLED device ${ip}`);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.log(
          "error",
          `Error initializing WLED device ${ip}: ${errorMessage}`,
        );
      }
    }

    if (successCount > 0) {
      this.setOnline(true);
    }

    this.log("info", `Initialized ${successCount} WLED devices`);
  }

  async healthCheck(): Promise<IntegrationHealthStatus> {
    const wledDevices = globalConfig.wledDevices;
    let onlineCount = 0;

    for (const deviceIp of wledDevices) {
      try {
        const device = new WLEDClient(deviceIp);
        await device.connect();
        onlineCount++;
        device.disconnect();
      } catch (error) {
        // Device offline
      }
    }

    const isOnline = onlineCount > 0;
    this.setOnline(isOnline);
    return isOnline ? "online" : "offline";
  }

  async listDevices(): Promise<ListDevicesResponse> {
    const wledDevices = globalConfig.wledDevices;
    const devices = wledDevices.map((ip, index) => ({
      id: ip,
      label: `WLED Device ${index + 1} (${ip})`,
      state: undefined,
    }));

    return {
      devices,
      selectedDevices: wledDevices,
    };
  }

  async control(args: IntegrationControlArgs): Promise<void> {
    if (!this._isOnline) return;

    const { controlType, color, brightness } = args;
    const convertedBrightness = Math.round((brightness / 100) * 255);
    const wledDevices = globalConfig.wledDevices;

    for (const deviceIp of wledDevices) {
      this.log(
        "debug",
        `Controlling WLED device ${deviceIp}, type: ${controlType}`,
      );
      try {
        const device = new WLEDClient(deviceIp);
        device.connect();

        switch (controlType) {
          case ControlType.ON:
            await device.clearSegments();
            await device.updateState({
              on: true,
              brightness: convertedBrightness,
              mainSegmentId: 0,
              segments: [
                {
                  effectId: 0,
                  colors: [[color.r, color.g, color.b]],
                  start: 0,
                  stop: device.info.leds.count,
                },
              ],
            });
            break;

          case ControlType.OFF:
            await device.updateState({ on: false });
            break;
        }

        device.disconnect();
      } catch (error) {
        this.log(
          "error",
          `Error controlling WLED device ${deviceIp}: ${error}`,
        );
      }
    }
  }
}

export const wledPlugin = new WLEDPlugin();
