import { integrationStates, ikeaVars } from "../../vars/vars";
import getHueSatFromRGB from "../../utils/getHueSatFromRGB";
import log from "electron-log";
import rgbToColorTempUsingFlag from "../../utils/rgbToColorTempUsingFlag";

export default async function ikeaControl(r, g, b, brightness, action, flag){
  if (!integrationStates.ikeaOnline){
    return;
  }

  const allIkeaDevices = ikeaVars.allIkeaDevices;
  const colorDevices = ikeaVars.colorDevices;
  const whiteDevices = ikeaVars.whiteDevices;

  switch (action) {
    case "on":
      const hueAndSat = await getHueSatFromRGB(r, g, b);
      const hueValue = hueAndSat.hue;
      const saturationValue = hueAndSat.sat;

      colorDevices.forEach(device => {
        log.debug(`Setting IKEA Tradfri color device ${device} to ${hueValue} and ${saturationValue}`);
        const ikeaDevice = allIkeaDevices[device].lightList[0];
        ikeaDevice.toggle(true);
        ikeaDevice.setHue(hueValue, 0);
        ikeaDevice.setSaturation(saturationValue, 0);
        ikeaDevice.setBrightness(brightness, 0);
      });
      for (const device of whiteDevices) {
        log.debug(`Setting IKEA Tradfri white device ${device} to ${brightness}`);
        const ikeaDevice = allIkeaDevices[device].lightList[0];
        const colorTemp = await rgbToColorTempUsingFlag(flag);
        ikeaDevice.toggle(true);
        ikeaDevice.setBrightness(brightness, 0);
        ikeaDevice.setColorTemperature(colorTemp, 0);
      }
      break;
    case "off":
      colorDevices.forEach(device => {
        log.debug(`Turning off IKEA Tradfri color device ${device}`);
        const ikeaDevice = allIkeaDevices[device].lightList[0];
        ikeaDevice.toggle(false);
      });
      whiteDevices.forEach(device => {
        log.debug(`Turning off IKEA Tradfri white device ${device}`);
        const ikeaDevice = allIkeaDevices[device].lightList[0];
        ikeaDevice.toggle(false);
      });
      break;
  }
}