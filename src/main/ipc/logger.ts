import { shell, ipcMain } from "electron";
import log from "electron-log";


const handleOpenLogfile = () => {
  shell.openPath(log.transports.file.getFile().path);
};

const handleGetLogs = () => {
  return log.transports.file.readAllLogs()[0].lines;
};

function registerLoggerIPCHandlers() {
  ipcMain.handle("f1mvli:log:open", handleOpenLogfile);
  ipcMain.handle("f1mvli:log:get", handleGetLogs);

  return function () {
    ipcMain.removeHandler("f1mvli:log:open");
    ipcMain.removeHandler("f1mvli:log:get");
  };
}

export {
  registerLoggerIPCHandlers,
};
