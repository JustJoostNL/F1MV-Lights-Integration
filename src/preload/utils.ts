import { ipcRenderer } from "electron";

type IntegrationState = {
  name: string;
  state: boolean;
  disabled: boolean;
};

function getIntegrationStates(): Promise<IntegrationState[]> {
  return ipcRenderer.invoke("f1mvli:utils:get-integration-states");
}
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
  getIntegrationStates,
  getWindowSizes,
  relaunchApp,
  exitApp,
};
