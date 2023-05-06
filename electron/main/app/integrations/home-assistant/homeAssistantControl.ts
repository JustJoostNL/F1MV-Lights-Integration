import {configVars} from "../../../config/config";
import {integrationStates} from "../../vars/vars";
import { headers } from "./homeAssistantShared";
import fetch from "node-fetch";

export default async function homeAssistantControl(r, g, b, brightness, action) {
  const homeAssistantDevices: string[] | {} = configVars.homeAssistantDevices;

  if (integrationStates.homeAssistantOnline) {
    brightness = Math.round((brightness / 100) * 254);
    switch (action) {
      case "on":
        const reqURLOn = configVars.homeAssistantHost + ":" + configVars.homeAssistantPort + "/api/services/light/turn_on";
        for (const device in homeAssistantDevices) {
          const postData = {
            "entity_id": homeAssistantDevices[device],
            "rgb_color": [r, g, b],
            "brightness": brightness
          }
          const options = {
            method: "POST",
            headers: headers,
            body: JSON.stringify(postData)
          };
          await fetch(reqURLOn, options)
        }
        break;
      case "off":
        const reqURLOff = configVars.homeAssistantHost + ":" + configVars.homeAssistantPort + "/api/services/light/turn_off";
        for (const device in homeAssistantDevices) {
          const postData = {
            "entity_id": homeAssistantDevices[device]
          }
          const options = {
            method: "POST",
            headers: headers,
            body: JSON.stringify(postData)
          };
          await fetch(reqURLOff, options)
        }
        break;
    }
  }
}