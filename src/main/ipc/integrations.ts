import { ipcMain } from "electron";
import {
  homeAssistantCheckDeviceSpectrum,
  homeAssistantGetDevices,
} from "../lightController/integrations/homeAssistant/api";
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
    "f1mvli:integrations:homeAssistant:getDevices",
    handleHomeAssistantGetDevices,
  );
  ipcMain.handle(
    "f1mvli:integrations:homeAssistant:checkDeviceSpectrum",
    (_, arg) => {
      return handleHomeAssistantCheckDeviceSpectrum(arg);
    },
  );
  ipcMain.handle(
    "f1mvli:integrations:philipsHue:discoverBridge",
    handleDiscoverPhilipsHueBridge,
  );
  ipcMain.handle(
    "f1mvli:integrations:philipsHue:generateAuthToken",
    handleGeneratePhilipsHueBridgeAuthToken,
  );
  ipcMain.handle(
    "f1mvli:integrations:philipsHue:getDevices",
    handlePhilipsHueGetDevices,
  );
  ipcMain.handle(
    "f1mvli:integrations:philipsHue:getGroups",
    handlePhilipsHueGetGroups,
  );
  ipcMain.handle("f1mvli:integrations:openrgb:connect", handleConnectOpenRGB);
  ipcMain.handle(
    "f1mvli:integrations:tradfri:discoverGateway",
    handleDiscoverTradfriBridge,
  );
  ipcMain.handle(
    "f1mvli:integrations:tradfri:getDevices",
    handleGetTradfriDevices,
  );

  return function () {
    ipcMain.removeHandler("f1mvli:integrations:homeAssistant:getDevices");
    ipcMain.removeHandler(
      "f1mvli:integrations:homeAssistant:checkDeviceSpectrum",
    );
    ipcMain.removeHandler("f1mvli:integrations:philipsHue:discoverBridge");
    ipcMain.removeHandler("f1mvli:integrations:philipsHue:generateAuthToken");
    ipcMain.removeHandler("f1mvli:integrations:philipsHue:getDevices");
    ipcMain.removeHandler("f1mvli:integrations:philipsHue:getGroups");
    ipcMain.removeHandler("f1mvli:integrations:openrgb:connect");
    ipcMain.removeHandler("f1mvli:integrations:tradfri:discoverGateway");
    ipcMain.removeHandler("f1mvli:integrations:tradfri:getDevices");
  };
}

export { registerIntegrationsIPCHandlers };
