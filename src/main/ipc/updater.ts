import { ipcMain, app } from "electron";
import { UpdateCheckResult, autoUpdater } from "electron-updater";
import { UpdateResult } from "../../shared/updater/UpdateResult";

let updateInfo: UpdateCheckResult | null = null;

const handleCheckForUpdates = async () => {
  updateInfo = await autoUpdater.checkForUpdatesAndNotify();
};

const handleGetUpdateAvailable = async (): Promise<UpdateResult> => {
  if (!updateInfo) updateInfo = await autoUpdater.checkForUpdatesAndNotify();
  if (!updateInfo && !autoUpdater.forceDevUpdateConfig) {
    return {
      updateAvailable: false,
      currentVersion: app.getVersion(),
      newVersion: app.getVersion(),
    };
  }
  if (!updateInfo)
    return {
      updateAvailable: false,
      currentVersion: app.getVersion(),
      newVersion: app.getVersion(),
    };
  if (
    updateInfo.updateInfo.version.replace(/\./g, "") >
    app.getVersion().replace(/\./g, "")
  ) {
    return {
      updateAvailable: true,
      currentVersion: app.getVersion(),
      newVersion: updateInfo?.updateInfo.version,
    };
  } else {
    return {
      updateAvailable: false,
      currentVersion: app.getVersion(),
      newVersion: updateInfo.updateInfo.version,
    };
  }
};

const handleGetForceDevUpdate = () => {
  return autoUpdater.forceDevUpdateConfig;
};

function registerUpdaterIPCHandlers() {
  ipcMain.handle("f1mvli:updater:checkForUpdates", handleCheckForUpdates);
  ipcMain.handle("f1mvli:updater:getUpdateAvailable", handleGetUpdateAvailable);
  ipcMain.handle("f1mvli:updater:getForceDevUpdate", handleGetForceDevUpdate);

  return function () {
    ipcMain.removeHandler("f1mvli:updater:checkForUpdates");
    ipcMain.removeHandler("f1mvli:updater:getUpdateAvailable");
    ipcMain.removeHandler("f1mvli:updater:getForceDevUpdate");
  };
}

export { registerUpdaterIPCHandlers };
