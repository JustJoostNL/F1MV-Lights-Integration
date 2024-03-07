import { ipcRenderer } from "electron";

function getAppVersion(): Promise<string> {
  return ipcRenderer.invoke("f1mvli:appInfo:getAppVersion");
}

export const appInfoAPI = {
  getAppVersion,
};
