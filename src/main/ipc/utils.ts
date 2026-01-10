import {
  BrowserWindow,
  app,
  ipcMain,
  dialog,
  IpcMainInvokeEvent,
  OpenDialogOptions,
} from "electron";
import { mainWindow } from "..";
import { getAssetsPath } from "../utils/getAssetsPath";

const handleGetWindowSizes = () => {
  const allWindows = BrowserWindow.getAllWindows();
  const windowSizes: number[][] = [];
  allWindows.forEach((window) => {
    windowSizes.push(window.getSize());
  });
  return windowSizes;
};

const handleRelaunchApp = () => {
  app.relaunch();
  app.exit();
};

const handleExitApp = () => {
  app.quit();
};

const handleShowOpenDialog = async (
  _event: IpcMainInvokeEvent,
  options: OpenDialogOptions,
) => {
  const result = await dialog.showOpenDialog(options);
  return result;
};

const handlePlayAudio = async (
  _event: IpcMainInvokeEvent,
  filePath: string,
  volume?: number,
) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("f1mvli:utils:play-audio", {
      filePath,
      volume,
    });
  }
};

const handleGetAssetsPath = (
  _event: IpcMainInvokeEvent,
  relativePath?: string,
) => {
  return getAssetsPath(relativePath);
};

function registerUtilsIPCHandlers() {
  ipcMain.handle("f1mvli:utils:get-window-sizes", handleGetWindowSizes);
  ipcMain.handle("f1mvli:utils:relaunch-app", handleRelaunchApp);
  ipcMain.handle("f1mvli:utils:exit-app", handleExitApp);
  ipcMain.handle("f1mvli:utils:show-open-dialog", handleShowOpenDialog);
  ipcMain.handle("f1mvli:utils:play-audio", handlePlayAudio);
  ipcMain.handle("f1mvli:utils:get-assets-path", handleGetAssetsPath);

  return () => {
    ipcMain.removeHandler("f1mvli:utils:get-window-sizes");
    ipcMain.removeHandler("f1mvli:utils:relaunch-app");
    ipcMain.removeHandler("f1mvli:utils:exit-app");
    ipcMain.removeHandler("f1mvli:utils:show-open-dialog");
    ipcMain.removeHandler("f1mvli:utils:play-audio");
    ipcMain.removeHandler("f1mvli:utils:get-assets-path");
  };
}

export { registerUtilsIPCHandlers };
