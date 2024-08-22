import { ipcRenderer } from "electron";

function getAppVersion(): Promise<string> {
  return ipcRenderer.invoke("f1mvli:appInfo:get-app-version");
}

export const appInfoAPI = {
  getAppVersion,
};
