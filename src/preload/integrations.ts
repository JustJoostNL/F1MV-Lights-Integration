import { ipcRenderer } from "electron";
import { IHomeAssistantStatesResponse } from "../shared/integrations/homeAssistant_types";

function homeAssistantGetDevices(): Promise<{
  devices: IHomeAssistantStatesResponse[];
  selectedDevices: string[];
}> {
  return ipcRenderer.invoke("f1mvli:integrations:homeAssistant:getDevices");
}

function homeAssistantCheckDeviceSpectrum(entityId: string): Promise<boolean> {
  return ipcRenderer.invoke(
    "f1mvli:integrations:homeAssistant:checkDeviceSpectrum",
    entityId,
  );
}

export const integrationsAPI = {
  homeAssistant: {
    getDevices: homeAssistantGetDevices,
    checkDeviceSpectrum: homeAssistantCheckDeviceSpectrum,
  },
};
