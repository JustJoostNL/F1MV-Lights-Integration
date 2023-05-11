import { ikeaVars } from "../../vars/vars";
import log from "electron-log";
import { handleConfigGet } from "../../../config/config";

export default async function ikeaCheckSpectrum(){
  const selectedIkeaDevices = handleConfigGet(null, "Settings.ikeaSettings.deviceIDs");
  log.debug("Checking the spectrum's of all IKEA Tradfri devices...");

  ikeaVars.colorDevices = [];
  ikeaVars.whiteDevices = [];

  for (const device in selectedIkeaDevices) {
    log.debug("Checking the spectrum of device " + selectedIkeaDevices[device] + "...");
    const deviceToCheck = ikeaVars.allIkeaDevices[selectedIkeaDevices[device]];

    if (deviceToCheck.lightList[0].spectrum === "rgb"){
      log.debug("Device " + selectedIkeaDevices[device] + " is a color device.");
      ikeaVars.colorDevices.push(selectedIkeaDevices[device]);
    } else {
      log.debug("Device " + selectedIkeaDevices[device] + " is a white device.");
      ikeaVars.whiteDevices.push(selectedIkeaDevices[device]);
    }
  }
}