import { ipcMain } from "electron";
import log from "electron-log";
import { autoUpdater } from "electron-updater";
import { broadcastToAllWindows } from "../utils/broadcastToAllWindows";

let updateAvailable = false;

async function handleCheckForUpdates() {
  return await autoUpdater.checkForUpdates();
}

async function handleQuitAndInstall() {
  return autoUpdater.quitAndInstall();
}

function handleUpdateAvailable() {
  updateAvailable = true;
  log.info("Update available.");
  autoUpdater.downloadUpdate();
}

function handleUpdateNotAvailable() {
  updateAvailable = false;
  log.info("No update available.");
}

function handleUpdateDownloaded() {
  updateAvailable = true;
  log.info("Update downloaded.");
  broadcastToAllWindows("update-downloaded", null);
}

function handleGetUpdateAvailable() {
  return updateAvailable;
}

function handleUpdateError(error: Error) {
  log.error("An error occurred in the update process: " + error);
  broadcastToAllWindows("update-error", error.message);
}

function registerUpdaterIPCHandlers() {
  autoUpdater.on("error", handleUpdateError);
  autoUpdater.on("update-downloaded", handleUpdateDownloaded);
  autoUpdater.on("update-available", handleUpdateAvailable);
  autoUpdater.on("update-not-available", handleUpdateNotAvailable);
  autoUpdater.on("error", handleUpdateError);

  ipcMain.handle("f1mvli:updater:checkForUpdates", handleCheckForUpdates);
  ipcMain.handle("f1mvli:updater:getUpdateAvailable", handleGetUpdateAvailable);
  ipcMain.handle("f1mvli:updater:quitAndInstall", handleQuitAndInstall);

  return function () {
    autoUpdater.off("error", handleUpdateError);
    autoUpdater.off("update-downloaded", handleUpdateDownloaded);
    autoUpdater.off("update-available", handleUpdateAvailable);
    autoUpdater.off("update-not-available", handleUpdateNotAvailable);
    autoUpdater.off("error", handleUpdateError);

    ipcMain.removeHandler("f1mvli:updater:checkForUpdates");
    ipcMain.removeHandler("f1mvli:updater:getUpdateAvailable");
    ipcMain.removeHandler("f1mvli:updater:quitAndInstall");
  };
}

export { registerUpdaterIPCHandlers };
