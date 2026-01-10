import Govee from "govee-lan-control";
import { BaseIntegrationPlugin } from "../BaseIntegrationPlugin";
import { IntegrationApiError } from "../utils/error";
import {
  IntegrationPlugin,
  IntegrationControlArgs,
  ControlType,
} from "../../../shared/types/integration";
import { globalConfig } from "../../ipc/config";

export class GoveePlugin extends BaseIntegrationPlugin {
  readonly id = IntegrationPlugin.GOVEE;
  readonly name = "Govee";
  readonly enabledConfigKey = "goveeEnabled";
  readonly restartConfigKeys = [];

  private goveeInstance: Govee | undefined = undefined;

  async initialize(): Promise<void> {
    this.log("debug", "Initializing Govee...");

    // @ts-ignore - Govee default export issue
    this.goveeInstance = new Govee.default();
    this.setOnline(true);

    this.goveeInstance?.on("ready", () => {
      this.log("info", "Govee instance ready");
    });

    this.goveeInstance?.on("deviceAdded", (device) => {
      this.log("debug", `Govee device discovered: ${device.model}`);
    });
  }

  async shutdown(): Promise<void> {
    this.goveeInstance?.removeAllListeners();
    this.goveeInstance = undefined;
    await super.shutdown();
  }

  async control(args: IntegrationControlArgs): Promise<void> {
    if (!this.goveeInstance) {
      throw new IntegrationApiError("Govee instance not initialized");
    }
    if (this.goveeInstance.devicesArray.length === 0) {
      this.log("debug", "No Govee devices discovered");
      return;
    }

    const { controlType, color, brightness } = args;

    await Promise.allSettled(
      this.goveeInstance.devicesArray.map(async (device) => {
        if (controlType === ControlType.ON) {
          await device.actions.setBrightness(brightness);
          if (globalConfig.goveeFadeEnabled) {
            await device.actions.fadeColor({
              color: { rgb: [color.r, color.g, color.b] },
              time: 500,
            });
          } else {
            await device.actions.setColor({ rgb: [color.r, color.g, color.b] });
          }
          if (device.state.isOn === 0) await device.actions.setOn();
        } else {
          await device.actions.setOff();
        }
      }),
    );
  }
}

export const goveePlugin = new GoveePlugin();
