import { configVars } from "../../../config/config";
import { integrationStates } from "../../vars/vars";
import fetch from "node-fetch";
import homeAssistantCheckDeviceSpectrum from "./homeAssistantCheckDeviceSpectrum";
import rgbToColorTempUsingFlag from "../../utils/rgbToColorTempUsingFlag";

export default async function homeAssistantControl(r, g, b, brightness, action, flag) {
  const homeAssistantDevices: string[] | {} = configVars.homeAssistantDevices;
  const headers = {
    "Authorization": "Bearer " + configVars.homeAssistantToken,
    "Content-Type": "application/json"
  };

  if (integrationStates.homeAssistantOnline) {
    brightness = Math.round((brightness / 100) * 254);
    const colorTemp = await rgbToColorTempUsingFlag(flag);
    switch (action) {
      case "on":
        const reqURLOn = configVars.homeAssistantHost + ":" + configVars.homeAssistantPort + "/api/services/light/turn_on";
        for (const device in homeAssistantDevices) {
          const entityId = homeAssistantDevices[device];
          const supportsRGB = await homeAssistantCheckDeviceSpectrum(entityId);
          const postData = supportsRGB
            ? {
              "entity_id": entityId,
              "rgb_color": [r, g, b],
              "brightness": brightness
            }
            : {
              "entity_id": entityId,
              "color_temp": colorTemp,
              "brightness": brightness
            };
          const options = {
            method: "POST",
            headers: headers,
            body: JSON.stringify(postData)
          };
          await fetch(reqURLOn, options);
        }
        break;
      case "off":
        const reqURLOff = configVars.homeAssistantHost + ":" + configVars.homeAssistantPort + "/api/services/light/turn_off";
        for (const device in homeAssistantDevices) {
          const postData = {
            "entity_id": homeAssistantDevices[device]
          };
          const options = {
            method: "POST",
            headers: headers,
            body: JSON.stringify(postData)
          };
          await fetch(reqURLOff, options);
        }
        break;
    }
  }
}