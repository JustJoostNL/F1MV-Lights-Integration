import { BrowserWindow, app, ipcMain } from "electron";
import { integrationStates } from "../lightController/integrations/states";
import { homeAssistantOnlineCheck } from "../lightController/integrations/homeAssistant/api";
import { getConfig } from "./config";

const handleGetIntegrationStates = async () => {
  const config = await getConfig();
  if (config.homeAssistantEnabled) await homeAssistantOnlineCheck();

  const states = [
    {
      name: "homeAssistant",
      state: integrationStates.homeAssistant,
      disabled: !config.homeAssistantEnabled,
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
