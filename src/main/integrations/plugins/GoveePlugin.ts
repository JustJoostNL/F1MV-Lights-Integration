import Govee from "govee-lan-control";
import { BaseIntegrationPlugin } from "../BaseIntegrationPlugin";
import { IntegrationApiError } from "../utils/error";
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

    for (const device of this.goveeInstance.devicesArray) {
      if (controlType === ControlType.ON) {
        device.actions.setBrightness(brightness);
        device.actions.setColor({ rgb: [color.r, color.g, color.b] });
        if (device.state.isOn === 0) device.actions.setOn();
      } else {
        device.actions.setOff();
      }
    }
  }
}

export const goveePlugin = new GoveePlugin();
