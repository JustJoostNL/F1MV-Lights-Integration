import { WLEDClient } from "wled-client";
import { BaseIntegrationPlugin } from "../BaseIntegrationPlugin";
import { globalConfig } from "../../ipc/config";
import { IntegrationApiError } from "../utils/error";
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

  private validateConfiguration(): void {
    if (!globalConfig.wledDevices || globalConfig.wledDevices.length === 0) {
      throw new IntegrationApiError("No WLED devices configured");
    }
  }

  async initialize(): Promise<void> {
    this.validateConfiguration();
    this.log("debug", "Initializing WLED devices...");

    let successCount = 0;
    for (const ip of globalConfig.wledDevices) {
      try {
        const device = new WLEDClient(ip);
        await device.connect();
        device.disconnect();
        successCount++;
        this.log("debug", `WLED device ${ip} initialized`);
      } catch (error) {
        const reason =
          error instanceof Error ? error.message : "Connection failed";
        this.log("warn", `WLED device ${ip} failed to initialize: ${reason}`);
      }
    }

    if (successCount === 0) {
      throw new IntegrationApiError("Failed to initialize any WLED devices");
    }

    this.setOnline(true);
    this.log(
      "info",
      `Initialized ${successCount}/${globalConfig.wledDevices.length} WLED devices`,
    );
  }

  async healthCheck(): Promise<IntegrationHealthStatus> {
    this.validateConfiguration();

    let onlineCount = 0;
    for (const ip of globalConfig.wledDevices) {
      try {
        const device = new WLEDClient(ip);
        await device.connect();
        device.disconnect();
        onlineCount++;
      } catch {
        // Device offline
      }
    }

    const isOnline = onlineCount > 0;
    this.setOnline(isOnline);
    return isOnline
      ? IntegrationHealthStatus.ONLINE
      : IntegrationHealthStatus.OFFLINE;
  }

  async listDevices(): Promise<ListDevicesResponse> {
    this.validateConfiguration();
    return {
      devices: globalConfig.wledDevices.map((ip, index) => ({
        id: ip,
        label: `WLED Device ${index + 1} (${ip})`,
        state: undefined,
      })),
      selectedDevices: globalConfig.wledDevices,
    };
  }

  async control(args: IntegrationControlArgs): Promise<void> {
    if (!this._isOnline) return;
    this.validateConfiguration();

    const { controlType, color, brightness } = args;
    const convertedBrightness = Math.round((brightness / 100) * 255);

    await Promise.allSettled(
      globalConfig.wledDevices.map(async (deviceIp) => {
        const device = new WLEDClient(deviceIp);
        await device.connect();

        if (controlType === ControlType.ON) {
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
        } else {
          await device.updateState({ on: false });
        }

        device.disconnect();
      }),
    );
  }
}

export const wledPlugin = new WLEDPlugin();
