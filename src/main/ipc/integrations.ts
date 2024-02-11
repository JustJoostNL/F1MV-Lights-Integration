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

  return function () {
    ipcMain.removeHandler("f1mvli:integrations:homeAssistant:getDevices");
    ipcMain.removeHandler(
      "f1mvli:integrations:homeAssistant:checkDeviceSpectrum",
    );
    ipcMain.removeHandler("f1mvli:integrations:philipsHue:discoverBridge");
    ipcMain.removeHandler("f1mvli:integrations:philipsHue:generateAuthToken");
    ipcMain.removeHandler("f1mvli:integrations:philipsHue:getDevices");
    ipcMain.removeHandler("f1mvli:integrations:philipsHue:getGroups");
  };
}

export { registerIntegrationsIPCHandlers };
