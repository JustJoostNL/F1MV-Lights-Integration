import { BrowserWindow, app, ipcMain } from "electron";
import { integrationStates } from "../lightController/integrations/states";
import { homeAssistantOnlineCheck } from "../lightController/integrations/homeAssistant/api";
import { homebridgeOnlineCheck } from "../lightController/integrations/homebridge/api";
import { philipsHueOnlineCheck } from "../lightController/integrations/philipsHue/api";
import { tradfriOnlineCheck } from "../lightController/integrations/tradfri/api";
import { getConfig } from "./config";

const handleGetIntegrationStates = async () => {
  const config = await getConfig();

  const checks: { enabled: boolean; fn: () => Promise<string> }[] = [
    {
      enabled: config.homeAssistantEnabled,
      fn: homeAssistantOnlineCheck,
    },
    {
      enabled: config.homebridgeEnabled,
      fn: homebridgeOnlineCheck,
    },
    {
      enabled: config.philipsHueEnabled,
      fn: philipsHueOnlineCheck,
    },
    {
      enabled: config.ikeaEnabled,
      fn: tradfriOnlineCheck,
    },
  ];

  const enabledChecks = checks.filter((check) => check.enabled);
  await Promise.all(enabledChecks.map((check) => check.fn()));

  const states = [
    {
      name: "multiviewer",
      state: integrationStates.multiviewer,
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
    "f1mvli:utils:get-integration-states",
    handleGetIntegrationStates,
  );
  ipcMain.handle("f1mvli:utils:get-window-sizes", handleGetWindowSizes);
  ipcMain.handle("f1mvli:utils:relaunch-app", handleRelaunchApp);
  ipcMain.handle("f1mvli:utils:exit-app", handleExitApp);

  return () => {
    ipcMain.removeHandler("f1mvli:utils:get-integration-states");
    ipcMain.removeHandler("f1mvli:utils:get-window-sizes");
    ipcMain.removeHandler("f1mvli:utils:relaunch-app");
    ipcMain.removeHandler("f1mvli:utils:exit-app");
  };
}

export { registerUtilsIPCHandlers };
