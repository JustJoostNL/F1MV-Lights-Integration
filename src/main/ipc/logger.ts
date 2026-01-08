import { rm } from "fs";
import { shell, ipcMain } from "electron";
import log from "electron-log";

const handleOpenLogfile = () => {
  shell.openPath(log.transports.file.getFile().path);
};

const handleGetLogs = () => {
  return log.transports.file.readAllLogs()[0]?.lines ?? [];
};

const handleClearLogs = async () => {
  const logFilePath = log.transports.file.getFile().path;
  rm(logFilePath, () => {});
};

function registerLoggerIPCHandlers() {
  ipcMain.handle("f1mvli:log:open", handleOpenLogfile);
  ipcMain.handle("f1mvli:log:get", handleGetLogs);
  ipcMain.handle("f1mvli:log:clear", handleClearLogs);

  return () => {
    ipcMain.removeHandler("f1mvli:log:open");
    ipcMain.removeHandler("f1mvli:log:get");
    ipcMain.removeHandler("f1mvli:log:clear");
  };
}

export { registerLoggerIPCHandlers };
