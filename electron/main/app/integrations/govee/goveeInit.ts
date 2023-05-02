import Govee from "govee-lan-control";
import { goveeVars } from "../../vars/vars";
import log from "electron-log";

export default async function goveeInitialize(){
  try {
    goveeVars.govee = new Govee();
    goveeVars.goveeInitialized = true;
  } catch (error) {
    goveeVars.goveeInitialized = false;
    log.error(error);
  }
  goveeVars.govee.on("ready", () => {
    log.info("Govee integration is ready.");
  });
  goveeVars.govee.on("deviceAdded", (device) => {
    log.info("Govee device found: " + device.model);
  });
}