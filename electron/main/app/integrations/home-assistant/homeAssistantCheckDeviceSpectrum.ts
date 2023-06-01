import { configVars } from "../../../config/config";
import log from "electron-log";

export default async function homeAssistantCheckDeviceSpectrum(entityId: string){
  const headers = {
    "Authorization": "Bearer " + configVars.homeAssistantToken,
    "Content-Type": "application/json"
  };

  const reqURL = configVars.homeAssistantHost + ":" + configVars.homeAssistantPort + "/api/states/" + entityId;
  const options = {
    method: "GET",
    headers: headers
  };
  let response;
  try {
    response = await fetch(reqURL, options);
  } catch (error) {
    log.error(`An error occurred while checking if Home Assistant device ${entityId} supports spectrum: ${error}`);
  }
  const data = await response.json();
  // if device doesn't have supported_color_modes, return false
  if(!data.attributes.supported_color_modes) return false;
  // check if color modes array has one of these: rgb, hs, xy
  return !!data.attributes.supported_color_modes.find((mode: string) => mode === "rgb" || mode === "hs" || mode === "xy");
}