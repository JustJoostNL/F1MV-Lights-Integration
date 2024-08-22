import { app, ipcMain } from "electron";

function handleGetAppVersion() {
  return app.getVersion();
}

function registerAppInfoIPCHandlers() {
  ipcMain.handle("f1mvli:appInfo:get-app-version", handleGetAppVersion);

  return () => {
    ipcMain.removeHandler("f1mvli:appInfo:get-app-version");
  };
}

export { registerAppInfoIPCHandlers };
