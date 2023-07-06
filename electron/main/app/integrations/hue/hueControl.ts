import { configVars } from "../../../config/config";
import { hueVars, integrationStates } from "../../vars/vars";
import hueLightStateBuilder from "./hueLightStateBuilder";
import log from "electron-log";

// hue light state builder arg format:
// {
//   "on": true,
//   "groupMode": false,
//   "brightness": 100,
//   "x": 0,
//   "y": 0,
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
  const converter = require("@q42philips/hue-color-converter");
  const colorTransData = converter.calculateXY(r, g, b);
  const XValue = colorTransData[0];
  const YValue = colorTransData[1];

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
          x: configVars.hueThirdPartyCompatMode ? XValue : undefined,
          y: configVars.hueThirdPartyCompatMode ? YValue : undefined,
          transition: configVars.hueEnableFade ? "fade" : "instant",
          thirdPartyCompatibility: configVars.hueThirdPartyCompatMode
        });
        try {
          await hueVars.authHueAPI.lights.setLightState(device, lightState);
        } catch (e){
          log.error(`Failed to set light state for Hue device ${device}: ${e}`);
        }
      }
      for (const entertainmentZone of configVars.hueEntertainmentZones){
        const lightState = await hueLightStateBuilder({
          on: true,
          groupMode: true,
          brightness: brightness,
          x: XValue,
          y: YValue,
          transition: configVars.hueEnableFade ? "fade" : "instant",
          thirdPartyCompatibility: configVars.hueThirdPartyCompatMode
        });
        try {
          await hueVars.authHueAPI.groups.setGroupState(entertainmentZone, lightState);
        } catch (e){
          log.error(`Failed to set light state for Hue entertainment zone ${entertainmentZone}: ${e}`);
        }
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
        try {
          await hueVars.authHueAPI.lights.setLightState(device, lightState);
        } catch (e){
          log.error(`Failed to set light state for Hue device ${device}: ${e}`);
        }
      }
      for (const entertainmentZone of configVars.hueEntertainmentZones){
        const lightState = await hueLightStateBuilder({
          on: false,
          groupMode: true,
          transition: configVars.hueEnableFade ? "fade" : "instant",
          thirdPartyCompatibility: configVars.hueThirdPartyCompatMode
        });
        try {
          await hueVars.authHueAPI.groups.setGroupState(entertainmentZone, lightState);
        } catch (e){
          log.error(`Failed to set light state for Hue entertainment zone ${entertainmentZone}: ${e}`);
        }
      }
      break;
  }
}