import log from "electron-log";
import Govee from "govee-lan-control";
import { ControlType } from "../../controlAllLights";
import { integrationStates } from "../states";

let goveeInstance: Govee | undefined = undefined;

export interface GoveeControlArgs {
  controlType: ControlType;
  color: {
    r: number;
    g: number;
    b: number;
  };
  brightness: number;
}

export async function goveeInitialize() {
  try {
    // @ts-ignore
    goveeInstance = new Govee.default();
    integrationStates.govee = true;
  } catch (e) {
    integrationStates.govee = false;
    log.error("Error initializing Govee instance: ", e);
  }
  goveeInstance?.on("ready", () => {
    log.info("Govee instance ready.");
  });
  goveeInstance?.on("deviceAdded", (device) => {
    log.info("Govee device found: ", device.model);
  });
}

export async function goveeControl({
  controlType,
  color,
  brightness,
}: GoveeControlArgs) {
  goveeInstance?.devicesArray.forEach((device) => {
    switch (controlType) {
      case ControlType.On:
        device.actions.setBrightness(brightness);
        device.actions.setColor({
          rgb: [color.r, color.g, color.b],
        });

        if (device.state.isOn === 0) {
          device.actions.setOn();
        }
        break;
      case ControlType.Off:
        device.actions.setOff();
        break;
    }
  });
}
