import { ipcMain } from "electron";
import {
  homeAssistantCheckDeviceSpectrum,
  homeAssistantGetDevices,
} from "../lightController/integrations/homeAssistant/api";

async function handleHomeAssistantGetDevices() {
  return await homeAssistantGetDevices();
}

async function handleHomeAssistantCheckDeviceSpectrum(entityId: string) {
  return await homeAssistantCheckDeviceSpectrum(entityId);
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

  return function () {
    ipcMain.removeHandler("f1mvli:integrations:homeAssistant:getDevices");
  };
}

export { registerIntegrationsIPCHandlers };
