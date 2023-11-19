import { ipcRenderer } from "electron";
import { UpdateCheckResult } from "electron-updater";

function checkForUpdates(): Promise<UpdateCheckResult> {
  return ipcRenderer.invoke("f1mvli:updater:checkForUpdates");
}
function getUpdateAvailable(): Promise<boolean> {
  return ipcRenderer.invoke("f1mvli:updater:getUpdateAvailable");
}
function quitAndInstall(): Promise<void> {
  return ipcRenderer.invoke("f1mvli:updater:quitAndInstall");
}

export const updaterAPI = {
  checkForUpdates,
  getUpdateAvailable,
  quitAndInstall,
};
