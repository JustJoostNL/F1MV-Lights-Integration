import { configVars } from "../../../config/config";
import { hueVars, integrationStates } from "../../vars/vars";
import getHueSatFromRGB from "../../utils/getHueSatFromRGB";
import hueLightStateBuilder from "./hueLightStateBuilder";

// hue light state builder arg format:
// {
//   "on": true,
//   "groupMode": false,
//   "brightness": 100,
//   "hue": 0,
//   "sat": 0,
//   "rgb": {
//     r: 255,
//     g: 255,
//     b: 255
//   },
//   "transition": "instant/fade",
//   "thirdPartyCompatibility": false,
// }

export default async function hueControl(r, g, b, brightness, action){
  if (configVars.hueDisable || !integrationStates.hueOnline) return;

  brightness = Math.round((brightness / 100) * 254);
  const colorTransData = await getHueSatFromRGB(r, g, b);
  const hueValue = Math.round(colorTransData.hue * (65535 / 360));
  const satValue = Math.round(colorTransData.sat * (254 / 100));

  switch (action){
    case "on":
      for (const device of configVars.hueDevices){
        const lightState = await hueLightStateBuilder({
          on: true,
          groupMode: false,
          brightness: brightness,
          rgb: {
            r: r,
            g: g,
            b: b
          },
          hue: hueValue,
          sat: satValue,
          transition: configVars.hueEnableFade ? "fade" : "instant",
          thirdPartyCompatibility: configVars.hueThirdPartyCompatMode
        });
        await hueVars.authHueAPI.lights.setLightState(device, lightState);
      }
      for (const entertainmentZone of configVars.hueEntertainmentZones){
        const lightState = await hueLightStateBuilder({
          on: true,
          groupMode: true,
          brightness: brightness,
          hue: hueValue,
          sat: satValue,
          transition: configVars.hueEnableFade ? "fade" : "instant",
          thirdPartyCompatibility: configVars.hueThirdPartyCompatMode
        });
        await hueVars.authHueAPI.groups.setGroupState(entertainmentZone, lightState);
      }
      break;
    case "off":
      for (const device of configVars.hueDevices){
        const lightState = await hueLightStateBuilder({
          on: false,
          groupMode: false,
          transition: configVars.hueEnableFade ? "fade" : "instant",
          thirdPartyCompatibility: configVars.hueThirdPartyCompatMode
        });
        await hueVars.authHueAPI.lights.setLightState(device, lightState);
      }
      for (const entertainmentZone of configVars.hueEntertainmentZones){
        const lightState = await hueLightStateBuilder({
          on: false,
          groupMode: true,
          transition: configVars.hueEnableFade ? "fade" : "instant",
          thirdPartyCompatibility: configVars.hueThirdPartyCompatMode
        });
        await hueVars.authHueAPI.groups.setGroupState(entertainmentZone, lightState);
      }
      break;
  }

}