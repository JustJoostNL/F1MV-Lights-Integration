import { ipcRenderer } from "electron";

function openLogFile(): Promise<void> {
  return ipcRenderer.invoke("f1mvli:log:open");
}
function getLogs(): Promise<string[]> {
  return ipcRenderer.invoke("f1mvli:log:get");
}

export const loggerAPI = {
  openLogFile,
  getLogs,
};
