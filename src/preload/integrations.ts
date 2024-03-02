import { ipcRenderer } from "electron";
import { IHomeAssistantStatesResponse } from "../shared/integrations/homeAssistant_types";
import {
  DiscoverPhilipsHueBridgeResponse,
  GeneratePhilipsHueBridgeAuthTokenResponse,
  GetPhilipsHueGroupsResponse,
  GetPhilipsHueDevicesResponse,
} from "../shared/integrations/philipsHue_types";

// home assistant
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

// philips hue
function discoverPhilipsHueBridge(): Promise<DiscoverPhilipsHueBridgeResponse> {
  return ipcRenderer.invoke("f1mvli:integrations:philipsHue:discoverBridge");
}

function generatePhilipsHueBridgeAuthToken(): Promise<GeneratePhilipsHueBridgeAuthTokenResponse> {
  return ipcRenderer.invoke("f1mvli:integrations:philipsHue:generateAuthToken");
}

function getPhilipsHueDevices(): Promise<GetPhilipsHueDevicesResponse> {
  return ipcRenderer.invoke("f1mvli:integrations:philipsHue:getDevices");
}

function getPhilipsHueGroups(): Promise<GetPhilipsHueGroupsResponse> {
  return ipcRenderer.invoke("f1mvli:integrations:philipsHue:getGroups");
}

// openrgb
function openrgbInitialize(): Promise<void> {
  return ipcRenderer.invoke("f1mvli:integrations:openrgb:connect");
}

export const integrationsAPI = {
  homeAssistant: {
    getDevices: homeAssistantGetDevices,
    checkDeviceSpectrum: homeAssistantCheckDeviceSpectrum,
  },
  philipsHue: {
    discoverBridge: discoverPhilipsHueBridge,
    generateAuthToken: generatePhilipsHueBridgeAuthToken,
    getDevices: getPhilipsHueDevices,
    getGroups: getPhilipsHueGroups,
  },
  openrgb: {
    connect: openrgbInitialize,
  },
};
