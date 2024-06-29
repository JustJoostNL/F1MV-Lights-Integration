import { BrowserWindow, app, ipcMain } from "electron";
import { integrationStates } from "../lightController/integrations/states";
import { homeAssistantOnlineCheck } from "../lightController/integrations/homeAssistant/api";
import { homebridgeOnlineCheck } from "../lightController/integrations/homebridge-http/api";
import { philipsHueOnlineCheck } from "../lightController/integrations/philipsHue/api";
import { tradfriOnlineCheck } from "../lightController/integrations/tradfri/api";
import { getConfig } from "./config";

const handleGetIntegrationStates = async () => {
  const config = await getConfig();
  if (config.homeAssistantEnabled) await homeAssistantOnlineCheck();
  if (config.homebridgeEnabled) await homebridgeOnlineCheck();
  if (config.philipsHueEnabled) await philipsHueOnlineCheck();
  if (config.ikeaEnabled) await tradfriOnlineCheck();

  const states = [
    {
      name: "multiviewer",
      state: integrationStates.multiviewer,
      disabled: false,
    },
    {
      name: "autoUpdater",
      state: integrationStates.autoUpdater,
      disabled: false,
    },
    {
      name: "f1tvLiveSession",
      state: integrationStates.f1tvLiveSession,
      disabled: false,
    },
    {
      name: "homeAssistant",
      state: integrationStates.homeAssistant,
      disabled: !config.homeAssistantEnabled,
    },
    {
      name: "homebridge",
      state: integrationStates.homebridge,
      disabled: !config.homebridgeEnabled,
    },
    {
      name: "philipsHue",
      state: integrationStates.philipsHue,
      disabled: !config.philipsHueEnabled,
    },
    {
      name: "govee",
      state: integrationStates.govee,
      disabled: !config.goveeEnabled,
    },
    {
      name: "webserver",
      state: integrationStates.webserver,
      disabled: !config.webserverEnabled,
    },
    {
      name: "streamdeck",
      state: integrationStates.streamdeck,
      disabled: !config.streamdeckEnabled,
    },
    {
      name: "openrgb",
      state: integrationStates.openrgb,
      disabled: !config.openrgbEnabled,
    },
    {
      name: "mqtt",
      state: integrationStates.mqtt,
      disabled: !config.mqttEnabled,
    },
    {
      name: "wled",
      state: integrationStates.wled,
      disabled: !config.wledEnabled,
    },
    {
      name: "tradfri",
      state: integrationStates.tradfri,
      disabled: !config.ikeaEnabled,
    },
  ];

  return states;
};

const handleGetWindowSizes = () => {
  const allWindows = BrowserWindow.getAllWindows();
  const windowSizes: number[][] = [];
  allWindows.forEach((window) => {
    windowSizes.push(window.getSize());
  });
  return windowSizes;
};

const handleRelaunchApp = () => {
  app.relaunch();
  app.exit();
};

const handleExitApp = () => {
  app.quit();
};

function registerUtilsIPCHandlers() {
  ipcMain.handle(
    "f1mvli:utils:getIntegrationStates",
    handleGetIntegrationStates,
  );
  ipcMain.handle("f1mvli:utils:getWindowSizes", handleGetWindowSizes);
  ipcMain.handle("f1mvli:utils:relaunchApp", handleRelaunchApp);
  ipcMain.handle("f1mvli:utils:exitApp", handleExitApp);

  return function () {
    ipcMain.removeHandler("f1mvli:utils:getIntegrationStates");
    ipcMain.removeHandler("f1mvli:utils:getWindowSizes");
    ipcMain.removeHandler("f1mvli:utils:relaunchApp");
    ipcMain.removeHandler("f1mvli:utils:exitApp");
  };
}

export { registerUtilsIPCHandlers };
