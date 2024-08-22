import { ipcRenderer } from "electron";
import { UpdateCheckResult } from "electron-updater";

function checkForUpdates(): Promise<UpdateCheckResult> {
  return ipcRenderer.invoke("f1mvli:updater:check-for-updates");
}
function getUpdateAvailable(): Promise<boolean> {
  return ipcRenderer.invoke("f1mvli:updater:get-update-available");
}
function quitAndInstall(): Promise<void> {
  return ipcRenderer.invoke("f1mvli:updater:quit-and-install");
}

export const updaterAPI = {
  checkForUpdates,
  getUpdateAvailable,
  quitAndInstall,
};
