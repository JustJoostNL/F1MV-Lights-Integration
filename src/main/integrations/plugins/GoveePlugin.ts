import Govee from "govee-lan-control";
import { BaseIntegrationPlugin } from "../BaseIntegrationPlugin";
import {
  IntegrationPlugin,
  IntegrationControlArgs,
  ControlType,
} from "../../../shared/types/integration";

export class GoveePlugin extends BaseIntegrationPlugin {
  readonly id = IntegrationPlugin.GOVEE;
  readonly name = "Govee";
  readonly enabledConfigKey = "goveeEnabled";
  readonly restartConfigKeys = [];

  private goveeInstance: Govee | undefined = undefined;

  async initialize(): Promise<void> {
    try {
      // @ts-ignore
      this.goveeInstance = new Govee.default();
      this.setOnline(true);
    } catch (error) {
      this.setOnline(false);
      this.log("error", `Error initializing Govee instance: ${error}`);
    }

    this.goveeInstance?.on("ready", () => {
      this.log("debug", "Govee instance ready.");
    });

    this.goveeInstance?.on("deviceAdded", (device) => {
      this.log("debug", `Govee device found: ${device.model}`);
    });
  }

  async shutdown(): Promise<void> {
    this.goveeInstance = undefined;
    await super.shutdown();
  }

  async control(args: IntegrationControlArgs): Promise<void> {
    if (!this.goveeInstance) return;

    const { controlType, color, brightness } = args;

    this.goveeInstance.devicesArray.forEach((device) => {
      switch (controlType) {
        case ControlType.ON:
          device.actions.setBrightness(brightness);
          device.actions.setColor({ rgb: [color.r, color.g, color.b] });
          if (device.state.isOn === 0) {
            device.actions.setOn();
          }
          break;

        case ControlType.OFF:
          device.actions.setOff();
          break;
      }
    });
  }
}

export const goveePlugin = new GoveePlugin();
