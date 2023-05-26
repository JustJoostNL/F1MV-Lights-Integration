import { configVars } from "../../../config/config";

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
  const response = await fetch(reqURL, options);
  const data = await response.json();
  // if device doesn't have supported_color_modes, return false
  if(!data.attributes.supported_color_modes) return false;
  // check if color modes array has one of these: rgb, hs, xy
  return !!data.attributes.supported_color_modes.find((mode: string) => mode === "rgb" || mode === "hs" || mode === "xy");
}