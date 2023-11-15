import { join } from "node:path";
import { BrowserWindow, app, ipcMain } from "electron";
import { availablePort, preload, url } from "../index";

const handleGetIntegrationStates = () => {
  //todo: implement
  return "";
};

const handleGetWindowSizes = () => {
  const allWindows = BrowserWindow.getAllWindows();
  const windowSizes: number[][] = [];
  allWindows.forEach((window) => {
    windowSizes.push(window.getSize());
  });
  return windowSizes;
};

const handleChangeWindowTitle = (_, arg) => {
  const mainWindow = BrowserWindow.getAllWindows()[0];
  mainWindow.setTitle(arg);
};

const handleRelaunchApp = () => {
  app.relaunch();
  app.exit();
};

const handleExitApp = () => {
  app.quit();
};

const handleOpenWindow = (
  _: any,
  arg: { url: string; browserWindowOptions: any },
) => {
  const childWindow = new BrowserWindow({
    title: arg.browserWindowOptions.title,
    icon: join(process.env.PUBLIC, "favicon.ico"),
    width: arg.browserWindowOptions.width,
    height: arg.browserWindowOptions.height,
    webPreferences: {
      preload,
      backgroundThrottling: false,
      nodeIntegration: true,
      contextIsolation: false,
    },
    resizable: arg.browserWindowOptions.resizable,
    maximizable: arg.browserWindowOptions.maximizable,
    minimizable: arg.browserWindowOptions.minimizable,
    minWidth: arg.browserWindowOptions.minWidth,
    minHeight: arg.browserWindowOptions.minHeight,
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.setMenuBarVisibility(false);
    childWindow.loadURL(`${url}#${arg.url}`);
  } else {
    childWindow.setMenuBarVisibility(false);
    childWindow.loadURL(
      `http://localhost:${availablePort}/index.html#${arg.url}`,
    );
  }

  childWindow.webContents.on("did-finish-load", () => {
    childWindow.webContents.insertCSS(
      `
        ::-webkit-scrollbar {
            width: 10px;
        }
        ::-webkit-scrollbar-track {
            background: #1e1e1e;
        }
        ::-webkit-scrollbar-thumb {
            background: #888;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
      `,
    );
  });
};

function registerUtilsIPCHandlers() {
  ipcMain.handle(
    "f1mvli:utils:getIntegrationStates",
    handleGetIntegrationStates,
  );
  ipcMain.handle("f1mvli:utils:getWindowSizes", handleGetWindowSizes);
  ipcMain.handle("f1mvli:utils:changeWindowTitle", handleChangeWindowTitle);
  ipcMain.handle("f1mvli:utils:openNewWindow", handleOpenWindow);
  ipcMain.handle("f1mvli:utils:relaunchApp", handleRelaunchApp);
  ipcMain.handle("f1mvli:utils:exitApp", handleExitApp);

  return function () {
    ipcMain.removeHandler("f1mvli:utils:getStates");
    ipcMain.removeHandler("f1mvli:utils:getWindowSizes");
    ipcMain.removeHandler("f1mvli:utils:changeWindowTitle");
    ipcMain.removeHandler("f1mvli:utils:relaunchApp");
    ipcMain.removeHandler("f1mvli:utils:exitApp");
  };
}

export { registerUtilsIPCHandlers };
