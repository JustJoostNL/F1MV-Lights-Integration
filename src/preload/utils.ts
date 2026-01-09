import {
  ipcRenderer,
  OpenDialogOptions,
  OpenDialogReturnValue,
} from "electron";

type EventCallback = (...args: any[]) => void;

function on(event: string, callback: EventCallback) {
  const handler: EventCallback = (_event, ...args) => {
    callback(...args);
  };
  ipcRenderer.on(event, handler);
  return () => ipcRenderer.off(event, handler);
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
function showOpenDialog(
  options: OpenDialogOptions,
): Promise<OpenDialogReturnValue> {
  return ipcRenderer.invoke("f1mvli:utils:show-open-dialog", options);
}
function playAudio(filePath: string, volume?: number): Promise<void> {
  return ipcRenderer.invoke("f1mvli:utils:play-audio", filePath, volume);
}
function getAssetsPath(relativePath?: string): Promise<string> {
  return ipcRenderer.invoke("f1mvli:utils:get-assets-path", relativePath);
}

export const utilsAPI = {
  on,
  getWindowSizes,
  relaunchApp,
  exitApp,
  showOpenDialog,
  playAudio,
  getAssetsPath,
};
