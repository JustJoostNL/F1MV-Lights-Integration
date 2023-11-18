import { BrowserWindow, app, ipcMain } from "electron";

const handleGetIntegrationStates = () => {
  //todo: implement
  return "";
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
