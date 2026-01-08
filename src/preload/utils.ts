import { ipcRenderer } from "electron";

function getWindowSizes(): Promise<number[][]> {
  return ipcRenderer.invoke("f1mvli:utils:get-window-sizes");
}
function relaunchApp(): Promise<void> {
  return ipcRenderer.invoke("f1mvli:utils:relaunch-app");
}
function exitApp(): Promise<void> {
  return ipcRenderer.invoke("f1mvli:utils:exit-app");
}

export const utilsAPI = {
  getWindowSizes,
  relaunchApp,
  exitApp,
};
