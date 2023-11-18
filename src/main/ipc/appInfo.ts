import { app, ipcMain } from "electron";

function handleGetAppVersion() {
  return app.getVersion();
}

function registerAppInfoIPCHandlers() {
  ipcMain.handle("f1mvli:appInfo:getAppVersion", handleGetAppVersion);

  return function () {
    ipcMain.removeHandler("f1mvli:appInfo:getAppVersion");
  };
}

export { registerAppInfoIPCHandlers };
