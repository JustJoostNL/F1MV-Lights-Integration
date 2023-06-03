import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import { release } from "node:os";
import path, { join } from "node:path";
import {
  configVars,
  handleConfigGet,
  handleConfigGetAll,
  handleConfigOpenInEditor, handleConfigResetToDefault,
  handleConfigSet
} from "./config/config";
import initApp from "./app";
import portfinder from "portfinder";
import http from "http";
import handler from "serve-handler";
import * as Sentry from "@sentry/electron";
import { analyticsHandler } from "./app/analytics/analytics";
import simulateFlag from "./app/light-controller/simulateFlag";
import { autoUpdater, UpdateCheckResult } from "electron-updater";
import initUpdater from "./update";
import log from "electron-log";
import { handleIntegrationStates } from "./app/integrations/integration-states/integrationStates";
import homeAssistantGetDevices from "./app/integrations/home-assistant/homeAssistantGetDevices";
import { integrationStates, openRGBVars, streamDeckVars, webServerVars } from "./app/vars/vars";
import openRGBInitialize from "./app/integrations/openrgb/openRGBInit";
import homeAssistantCheckDeviceSpectrum from "./app/integrations/home-assistant/homeAssistantCheckDeviceSpectrum";
import getWLEDDevices from "./app/integrations/wled/getWLEDDevices";
import discoverHueBridge from "./app/integrations/hue/discoverHueBridge";
import discoverIkeaBridge from "./app/integrations/ikea/discoverIkeaBridge";
import ikeaGetDevices from "./app/integrations/ikea/ikeaGetDevices";
import hueGetDevices from "./app/integrations/hue/hueGetDevices";
import hueGetEntertainmentZones from "./app/integrations/hue/hueGetEntertainmentZones";
import { IEffectSetting } from "../types/EffectSettingsInterface";
import hueInitialize from "./app/integrations/hue/hueInit";
import { handleDeepLinking } from "./app/deeplinking/handleDeepLinking";

let urlLoadedInWindow = false;


Sentry.init({
  dsn: "https://e64c3ec745124566b849043192e58711@o4504289317879808.ingest.sentry.io/4504289338392576",
  attachScreenshot: true,
  //enabled: process.env.NODE_ENV === "production",
  release: "F1MV-Lights-Integration@" + app.getVersion(),
  environment: process.env.VITE_DEV_SERVER_URL ? "development" : "production",
  tracesSampleRate: 1.0,
});

// handle deep-link protocol
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("f1mvli", process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient("f1mvli");
}

async function doDeepLinking(data){
  if (data.action === "open_page") {
    process.env.VITE_DEV_SERVER_URL ? await win.loadURL(`${url}#${data.page}`) : await win.loadURL(`http://localhost:${availablePort}/index.html#${data.page}`);
  }
  if (data.action === "patch_config") {
    const configKey = data.configPatch.key.slice(1).trim();
    const keyWithoutQuotes = configKey.slice(1, -1);
    let configValue = data.configPatch.value.slice(0, -1).trim();
    const dialogResponse = await dialog.showMessageBox(win, {
      type: "info",
      buttons: ["Apply config changes", "Cancel"],
      title: "Do you want to apply config changes?",
      message: "Do you want to apply config changes?",
      detail:
`
Config patch:
{
  ${configKey}: ${configValue}
}
`,
    });
    if (dialogResponse.response === 0) {
      if (configValue === "true") {
        configValue = true;
      } else if (configValue === "false") {
        configValue = false;
      }
      else if (configValue.match(/\d+/g)) {
        configValue = parseInt(configValue);
      }
      await handleConfigSet(null, keyWithoutQuotes, configValue);
    }
  }
}

// handle deep-linking for mac
app.on("open-url", async (event, url) => {
  event.preventDefault();
  if (win) {
    win.show();
    win.focus();
    const data = await handleDeepLinking(url);
    await doDeepLinking(data);
  }
});

// handle deep-linking for windows/linux
app.on("second-instance", async (event, commandLine) => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
    const url = commandLine[commandLine.length - 1];
    const data = await handleDeepLinking(url);
    await doDeepLinking(data);
  }
});

// handle deep-linking for when the app is closed
app.on("ready", async () => {
  const url = process.argv[process.argv.length - 1];
  if (url.startsWith("f1mvli://")) {
    const urlLoadedInWindowIntervalCheck = setInterval(async () => {
      if (urlLoadedInWindow) {
        clearInterval(urlLoadedInWindowIntervalCheck);
        const data = await handleDeepLinking(url);
        await doDeepLinking(data);
      }
    }, 100);
  }
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
let availablePort: number;

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
      zoomFactor: 0.8,
    },
    resizable: true,
    maximizable: true,
    minimizable: false,
    minWidth: 1075,
    minHeight: 600,
  });

  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    await win.loadURL(url);
    setTimeout(() => {
      urlLoadedInWindow = true;
    }, 500);
    win.webContents.openDevTools({ mode: "detach" });
    win.setMenuBarVisibility(false);
  } else {
    win.setMenuBarVisibility(false);
    availablePort = await portfinder.getPortPromise({ port: 30303, host: "localhost" });
    const server = http.createServer((request, response) => {
      return handler(request, response, {
        public: process.env.DIST,
      });
    });
    server.listen(availablePort, () => {
      win?.loadURL(`http://localhost:${availablePort}/index.html`);
      setTimeout(() => {
        urlLoadedInWindow = true;
      }, 500);
    });
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
  initUpdater(win);
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

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

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
      zoomFactor: 0.8,
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
    childWindow.loadURL(`http://localhost:${availablePort}/index.html#${arg.url}`);
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
ipcMain.handle("config:resetToDefault", async () => {
  const dialogResponse = await dialog.showMessageBox(win, {
    type: "warning",
    buttons: ["Reset", "Cancel"],
    title: "Reset settings",
    message: "Are you sure you want to reset all your settings?",
    detail: "This will reset all your settings to the defaults, including your effects. \n\nResetting your settings may help to resolve issues.",
  });
  if (dialogResponse.response === 0) {
    await handleConfigResetToDefault();
    log.info("All settings reset to the defaults.");
    return true;
  } else {
    return false;
  }
});
ipcMain.handle("config:open:inEditor", handleConfigOpenInEditor);
export function configChangedEmitEvent(){
  win?.webContents.send("config:didAnyChange");
}

// utils
ipcMain.handle("utils:getHighestEffectId", () => {
  let highestId = 0;
  const allEffects = configVars.effectSettings as IEffectSetting[];
  allEffects.forEach((effect) => {
    if (effect.id > highestId){
      highestId = effect.id;
    }
  });
  return highestId;
});
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
  win.setTitle(arg);
});
ipcMain.handle("utils:relaunchApp", () => {
  app.relaunch();
  app.exit();
});
ipcMain.handle("utils:exitApp", () => {
  app.quit();
});

// updater
let updateInfo: UpdateCheckResult = null;
ipcMain.handle("updater:checkForUpdates", async () => {
  updateInfo = await autoUpdater.checkForUpdatesAndNotify();
});
ipcMain.handle("updater:getUpdateAvailable", async () => {
  if (!updateInfo) updateInfo = await autoUpdater.checkForUpdatesAndNotify();
  if (updateInfo.updateInfo.version.replace(/\./g, "") > app.getVersion().replace(/\./g, "")) {
    return {
      updateAvailable: true,
      currentVersion: app.getVersion(),
      newVersion: updateInfo.updateInfo.version,
    };
  } else {
    return {
      updateAvailable: false,
      currentVersion: app.getVersion(),
      newVersion: updateInfo.updateInfo.version,
    };
  }
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
ipcMain.handle("integrations:hue:connectToBridge", async () => {
  return await hueInitialize();
});
ipcMain.handle("integrations:hue:getLights", async () => {
  return await hueGetDevices();
});
ipcMain.handle("integrations:hue:getEntertainmentZones", async () => {
  return await hueGetEntertainmentZones();
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