import { ipcMain } from "electron";
import {
  homeAssistantCheckDeviceSpectrum,
  homeAssistantGetDevices,
} from "../lightController/integrations/homeAssistant/api";
import { homebridgeGetAccessories } from "../lightController/integrations/homebridge/api";
import {
  discoverPhilipsHueBridge,
  generatePhilipsHueBridgeAuthToken,
  getPhilipsHueDevices,
  getPhilipsHueGroups,
} from "../lightController/integrations/philipsHue/api";
import { openrgbInitialize } from "../lightController/integrations/openrgb/api";
import {
  discoverTradfriGateway,
  getTradfriDevices,
} from "../lightController/integrations/tradfri/api";

// home assistant
async function handleHomeAssistantGetDevices() {
  return await homeAssistantGetDevices();
}

async function handleHomeAssistantCheckDeviceSpectrum(entityId: string) {
  return await homeAssistantCheckDeviceSpectrum(entityId);
}

// homebridge
async function handleHomebridgeGetAccessories() {
  return await homebridgeGetAccessories();
}

//philips hue
async function handleDiscoverPhilipsHueBridge() {
  return await discoverPhilipsHueBridge();
}

async function handleGeneratePhilipsHueBridgeAuthToken() {
  return await generatePhilipsHueBridgeAuthToken();
}

async function handlePhilipsHueGetDevices() {
  return await getPhilipsHueDevices();
}

async function handlePhilipsHueGetGroups() {
  return await getPhilipsHueGroups();
}

//openrgb
async function handleConnectOpenRGB() {
  return await openrgbInitialize();
}

//tradfri
async function handleDiscoverTradfriBridge() {
  return await discoverTradfriGateway();
}

async function handleGetTradfriDevices() {
  return await getTradfriDevices();
}

function registerIntegrationsIPCHandlers() {
  ipcMain.handle(
    "f1mvli:integrations:homeassistant:get-devices",
    handleHomeAssistantGetDevices,
  );
  ipcMain.handle(
    "f1mvli:integrations:homeassistant:check-device-spectrum",
    (_, arg) => {
      return handleHomeAssistantCheckDeviceSpectrum(arg);
    },
  );
  ipcMain.handle(
    "f1mvli:integrations:homebridge:get-accessories",
    handleHomebridgeGetAccessories,
  );
  ipcMain.handle(
    "f1mvli:integrations:philips-hue:discover-bridge",
    handleDiscoverPhilipsHueBridge,
  );
  ipcMain.handle(
    "f1mvli:integrations:philips-hue:generate-auth-token",
    handleGeneratePhilipsHueBridgeAuthToken,
  );
  ipcMain.handle(
    "f1mvli:integrations:philips-hue:get-devices",
    handlePhilipsHueGetDevices,
  );
  ipcMain.handle(
    "f1mvli:integrations:philips-hue:get-groups",
    handlePhilipsHueGetGroups,
  );
  ipcMain.handle("f1mvli:integrations:openrgb:connect", handleConnectOpenRGB);
  ipcMain.handle(
    "f1mvli:integrations:tradfri:discover-gateway",
    handleDiscoverTradfriBridge,
  );
  ipcMain.handle(
    "f1mvli:integrations:tradfri:get-devices",
    handleGetTradfriDevices,
  );

  return () => {
    ipcMain.removeHandler("f1mvli:integrations:homeassistant:get-devices");
    ipcMain.removeHandler(
      "f1mvli:integrations:homeassistant:check-device-spectrum",
    );
    ipcMain.removeHandler("f1mvli:integrations:homebridge:get-accessories");
    ipcMain.removeHandler("f1mvli:integrations:philips-hue:discover-bridge");
    ipcMain.removeHandler(
      "f1mvli:integrations:philips-hue:generate-auth-token",
    );
    ipcMain.removeHandler("f1mvli:integrations:philips-hue:get-devices");
    ipcMain.removeHandler("f1mvli:integrations:philips-hue:get-groups");
    ipcMain.removeHandler("f1mvli:integrations:openrgb:connect");
    ipcMain.removeHandler("f1mvli:integrations:tradfri:discover-gateway");
    ipcMain.removeHandler("f1mvli:integrations:tradfri:get-devices");
  };
}

export { registerIntegrationsIPCHandlers };
