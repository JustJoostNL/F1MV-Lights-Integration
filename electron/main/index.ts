import { app, BrowserWindow, ipcMain, shell } from "electron";
import { release } from "node:os";
import path, { join } from "node:path";
import {
  configVars,
  handleConfigGet,
  handleConfigGetAll,
  handleConfigOpenInEditor,
  handleConfigSet
} from "./config/config";
import initApp from "./app";
import * as Sentry from "@sentry/electron";
import { analyticsHandler } from "./app/analytics/analytics";
import simulateFlag from "./app/light-controller/simulateFlag";
import { autoUpdater } from "electron-updater";
import initUpdater from "./update";
import log from "electron-log";
import { handleIntegrationStates } from "./app/integrations/integration-states/integrationStates";
import homeAssistantGetDevices from "./app/integrations/home-assistant/homeAssistantGetDevices";
import { f1mvli } from "../preload";
import { integrationStates, openRGBVars, streamDeckVars, webServerVars } from "./app/vars/vars";
import openRGBInitialize from "./app/integrations/openrgb/openRGBInit";
import homeAssistantCheckDeviceSpectrum from "./app/integrations/home-assistant/homeAssistantCheckDeviceSpectrum";
import getWLEDDevices from "./app/integrations/wled/getWLEDDevices";
import discoverHueBridge from "./app/integrations/hue/discoverHueBridge";
import discoverIkeaBridge from "./app/integrations/ikea/discoverIkeaBridge";
import ikeaGetDevices from "./app/integrations/ikea/ikeaGetDevices";
import ikeaCheckSpectrum from "./app/integrations/ikea/checkIkeaDeviceSpectrum";

Sentry.init({
  dsn: "https://e64c3ec745124566b849043192e58711@o4504289317879808.ingest.sentry.io/4504289338392576",
  release: "F1MV-Lights-Integration@" + app.getVersion(),
  tracesSampleRate: 0.2,
});

process.env.DIST_ELECTRON = join(__dirname, "../");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// Remove electron security warnings
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");

async function createWindow() {
  win = new BrowserWindow({
    title: "F1MV Lights Integration",
    icon: join(process.env.PUBLIC, "favicon.ico"),
    width: 1200,
    height: 700,
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
      zoomFactor: 1,
    },
    resizable: true,
    maximizable: true,
    minimizable: false,
    minWidth: 1075,
    minHeight: 600,
  });

  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    await win.loadURL(url);
    win.webContents.openDevTools({ mode: "detach" });
    win.setMenuBarVisibility(false);
  } else {
    win.removeMenu();
    await win.loadFile(indexHtml);
  }

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:" || "http:")) shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(onReady);

function onReady() {
  createWindow();

  win.webContents.on("did-finish-load", () => {
    win.webContents.insertCSS(`
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
        `);
  });

  // if (process.defaultApp) {
  //   if (process.argv.length >= 2) {
  //     app.setAsDefaultProtocolClient("f1mvli", process.execPath, [path.resolve(process.argv[1])]);
  //   }
  // } else {
  //   app.setAsDefaultProtocolClient("f1mvli");
  // }

  log.initialize({ preload: true });
  log.transports.console.level = false;
  if (process.env.VITE_DEV_SERVER_URL) {
    if (configVars.debugMode){
      log.transports.console.level = "debug";
    } else {
      log.transports.console.level = "info";
    }
  }
  if (configVars.debugMode){
    log.transports.file.level = "debug";
  } else {
    log.transports.file.level = "info";
  }

  log.info("App starting...");
  initUpdater();
  initApp();
}

app.on("window-all-closed", () => {
  win = null;
  analyticsHandler("activeUsersClose");
  if (integrationStates.openRGBOnline && !configVars.openRGBDisable){
    openRGBVars.openRGBClient.disconnect();
  }
  if (integrationStates.webServerOnline && !configVars.webServerDisable){
    webServerVars.webServerHTTPServer.close();
  }
  if (integrationStates.streamDeckOnline && !configVars.streamDeckDisable){
    streamDeckVars.theStreamDeck.close();
  }
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
ipcMain.handle("utils:open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    title: arg.browserWindowOptions.title,
    icon: join(process.env.PUBLIC, "favicon.ico"),
    width: arg.browserWindowOptions.width,
    height: arg.browserWindowOptions.height,
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
      zoomFactor: 1,
    },
    resizable: arg.browserWindowOptions.resizable,
    maximizable: arg.browserWindowOptions.maximizable,
    minimizable: arg.browserWindowOptions.minimizable,
    minWidth: arg.browserWindowOptions.minWidth,
    minHeight: arg.browserWindowOptions.minHeight,
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg.url}`);
    childWindow.setMenuBarVisibility(false);
  } else {
    childWindow.removeMenu();
    childWindow.loadFile(indexHtml, { hash: arg.url });
  }

  childWindow.webContents.on("did-finish-load", () => {
    childWindow.webContents.insertCSS(`
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
        `);
  });

});

// config
ipcMain.handle("config:set", handleConfigSet);
ipcMain.handle("config:get", handleConfigGet);
ipcMain.handle("config:get:all", handleConfigGetAll);
ipcMain.handle("config:open:inEditor", handleConfigOpenInEditor);
export function configChangedEmitEvent(){
  win?.webContents.send("config:didAnyChange");
}

// utils
ipcMain.handle("utils:getStates", () => {
  return handleIntegrationStates();
});
ipcMain.handle("utils:getWindowSizes", () => {
  // we return an array with all the window sizes from all active windows
  const allWindows = BrowserWindow.getAllWindows();
  const windowSizes = [];
  allWindows.forEach((window) => {
    windowSizes.push(window.getSize());
  });
  return windowSizes;
});
ipcMain.handle("utils:changeWindowTitle", (_, arg) => {
  win?.setTitle(arg);
});
ipcMain.handle("utils:exitApp", () => {
  app.quit();
});

// updater
ipcMain.handle("updater:checkForUpdate", () => {
  autoUpdater.checkForUpdates();
});

// log
ipcMain.handle("log:openLogFile", () => {
  shell.openPath(log.transports.file.getFile().path);
});

ipcMain.handle("log:getLogs", () => {
  return log.transports.file.readAllLogs()[0].lines;
});

// integrations
// home assistant
ipcMain.handle("integrations:homeAssistant:getDevices", () => {
  return homeAssistantGetDevices();
});
ipcMain.handle("integrations:homeAssistant:checkDeviceSpectrum", (_, arg) => {
  return homeAssistantCheckDeviceSpectrum(arg);
});
// wled
ipcMain.handle("integrations:WLED:getDevices", () => {
  return getWLEDDevices();
});
//openrgb
ipcMain.handle("integrations:openRGB:reConnect", () => {
  return openRGBInitialize();
});
// hue
ipcMain.handle("integrations:hue:discoverBridge", async (_, arg) => {
  return await discoverHueBridge(arg);
});
// ikea
ipcMain.handle("integrations:ikea:searchAndConnectToGateway", async () => {
  if (integrationStates.ikeaOnline){
    return {
      success: false,
      status: "info",
      message: "The app is already connected to an IKEA gateway!",
    };
  } else {
    return await discoverIkeaBridge();
  }
});
ipcMain.handle("integrations:ikea:getDevices", async () => {
  return await ikeaGetDevices();
});


// simulate flags
ipcMain.on("flagSim", (_, arg) => {
  simulateFlag(arg);
});