const {
  Bulb
} = require("yeelight.io");
import { configVars } from "../../../config/config";
import log from "electron-log";

export default async function yeeLightControl(r, g, b, brightness, action){
  if (configVars.yeeLightDisable){
    return;
  }

  configVars.yeeLightDevices.forEach(device => {
    const bulb = new Bulb(device);
    bulb.on("connected", (lamp) => {
      try {
        switch (action) {
          case "on":
            log.debug(`Turning on Yeelight device ${device}`);
            lamp.color(r, g, b);
            lamp.brightness(brightness);
            lamp.onn();
            lamp.disconnect();
            break;
          case "off":
            log.debug(`Turning off Yeelight device ${device}`);
            lamp.off();
            lamp.disconnect();
            break;
        }
      } catch (e) {
        log.warn(`Error with Yeelight device ${device}: ${e}`);
      }
    });
    bulb.on("error", (error) => {
      log.warn(`Error with Yeelight device ${device}: ${error}`);
    });
    bulb.connect();
  });
}