import { goveeVars, integrationStates } from "../../vars/vars";
import { configVars } from "../../../config/config";
import log from "electron-log";

export default async function goveeControl(r, g, b, brightness, action){
  if (integrationStates.goveeOnline){
    goveeVars.govee.devicesArray.forEach(device => {
      if(configVars.debugMode){
        log.info("Govee device selected: " + device.model);
      }
      switch (action){
        case "on":
          if (configVars.debugMode){
            log.info(`Turning on the Govee light with the following values: R: ${r}, G: ${g}, B: ${b}, Brightness: ${brightness}`);
          }
          device.actions.setBrightness(brightness);
          device.actions.setColor({
            rgb: [
              r,
              g,
              b
            ],
          });
          if (device.state.isOn === 0){
            device.actions.setOn();
          }
          break;
        case "off":
          if (configVars.debugMode){
            log.info("Turning off Govee light: " + device.model);
          }
          device.actions.setOff();
          break;
      }
    });
  }
}