import { ipcRenderer } from "electron";

type IntegrationState = {
  name: string;
  state: boolean;
  disabled: boolean;
};

function getIntegrationStates(): Promise<IntegrationState[]> {
  return ipcRenderer.invoke("f1mvli:utils:getIntegrationStates");
}
function getWindowSizes(): Promise<number[][]> {
  return ipcRenderer.invoke("f1mvli:utils:getWindowSizes");
}
function relaunchApp(): Promise<void> {
  return ipcRenderer.invoke("f1mvli:utils:relaunchApp");
}
function exitApp(): Promise<void> {
  return ipcRenderer.invoke("f1mvli:utils:exitApp");
}

export const utilsAPI = {
  getIntegrationStates,
  getWindowSizes,
  relaunchApp,
  exitApp,
};
