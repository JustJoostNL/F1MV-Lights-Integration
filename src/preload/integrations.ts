import { ipcRenderer } from "electron";
import { DiscoveredGateway } from "node-tradfri-client";
import { IHomeAssistantStatesResponse } from "../shared/integrations/homeAssistant_types";
import { IHomebridgeAccessory } from "../shared/integrations/homebridge_types";
import {
  DiscoverPhilipsHueBridgeResponse,
  GeneratePhilipsHueBridgeAuthTokenResponse,
  GetPhilipsHueGroupsResponse,
  GetPhilipsHueDevicesResponse,
} from "../shared/integrations/philipsHue_types";
import { IGetTradfriDevicesResponse } from "../shared/integrations/tradfri_types";

// home assistant
function homeAssistantGetDevices(): Promise<{
  devices: IHomeAssistantStatesResponse[];
  selectedDevices: string[];
}> {
  return ipcRenderer.invoke("f1mvli:integrations:homeassistant:get-devices");
}

function homeAssistantCheckDeviceSpectrum(entityId: string): Promise<boolean> {
  return ipcRenderer.invoke(
    "f1mvli:integrations:homeassistant:check-device-spectrum",
    entityId,
  );
}

// homebridge
function homebridgeGetAccessories(): Promise<{
  accessories: IHomebridgeAccessory[];
  selectedAccessories: string[];
}> {
  return ipcRenderer.invoke("f1mvli:integrations:homebridge:get-accessories");
}

// philips hue
function discoverPhilipsHueBridge(): Promise<DiscoverPhilipsHueBridgeResponse> {
  return ipcRenderer.invoke("f1mvli:integrations:philips-hue:discover-bridge");
}

function generatePhilipsHueBridgeAuthToken(): Promise<GeneratePhilipsHueBridgeAuthTokenResponse> {
  return ipcRenderer.invoke(
    "f1mvli:integrations:philips-hue:generate-auth-token",
  );
}

function getPhilipsHueDevices(): Promise<GetPhilipsHueDevicesResponse> {
  return ipcRenderer.invoke("f1mvli:integrations:philips-hue:get-devices");
}

function getPhilipsHueGroups(): Promise<GetPhilipsHueGroupsResponse> {
  return ipcRenderer.invoke("f1mvli:integrations:philips-hue:get-groups");
}

// openrgb
function openrgbInitialize(): Promise<void> {
  return ipcRenderer.invoke("f1mvli:integrations:openrgb:connect");
}

// tradfri
function discoverTradfriGateway(): Promise<DiscoveredGateway | null> {
  return ipcRenderer.invoke("f1mvli:integrations:tradfri:discover-gateway");
}

function getTradfriDevices(): Promise<IGetTradfriDevicesResponse | undefined> {
  return ipcRenderer.invoke("f1mvli:integrations:tradfri:get-devices");
}

export const integrationsAPI = {
  homeAssistant: {
    getDevices: homeAssistantGetDevices,
    checkDeviceSpectrum: homeAssistantCheckDeviceSpectrum,
  },
  homebridge: {
    getAccessories: homebridgeGetAccessories,
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
  tradfri: {
    discoverGateway: discoverTradfriGateway,
    getDevices: getTradfriDevices,
  },
};
