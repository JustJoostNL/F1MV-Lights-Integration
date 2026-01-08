import { BrowserWindow, app, ipcMain } from "electron";

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

function registerUtilsIPCHandlers() {
  ipcMain.handle("f1mvli:utils:get-window-sizes", handleGetWindowSizes);
  ipcMain.handle("f1mvli:utils:relaunch-app", handleRelaunchApp);
  ipcMain.handle("f1mvli:utils:exit-app", handleExitApp);

  return () => {
    ipcMain.removeHandler("f1mvli:utils:get-window-sizes");
    ipcMain.removeHandler("f1mvli:utils:relaunch-app");
    ipcMain.removeHandler("f1mvli:utils:exit-app");
  };
}

export { registerUtilsIPCHandlers };
