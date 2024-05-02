import { release } from "node:os";
import path from "path";
import { app, BrowserWindow, shell } from "electron";
import log from "electron-log";
import * as Sentry from "@sentry/electron";
import { autoUpdater } from "electron-updater";
import {
  fetchAuthoritativeConfig,
  globalConfig,
  registerConfigIPCHandlers,
} from "./ipc/config";
import { registerUpdaterIPCHandlers } from "./ipc/updater";
import { registerUtilsIPCHandlers } from "./ipc/utils";
import { registerLoggerIPCHandlers } from "./ipc/logger";
import { registerAppInfoIPCHandlers } from "./ipc/appInfo";
import { startLiveTimingDataPolling } from "./multiviewer/api";
import { registerEventManagerIPCHandlers } from "./ipc/eventManager";
import { registerIntegrationsIPCHandlers } from "./ipc/integrations";
import { initializeIntegrations } from "./initIntegrations";
import { handleRegisterUser, handleUserActiveExit } from "./analytics/api";
import { registerDeepLink } from "./deeplinking";
import { mqttClient } from "./lightController/integrations/mqtt/api";
import { integrationStates } from "./lightController/integrations/states";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

Sentry.init({
  dsn: "https://e64c3ec745124566b849043192e58711@o4504289317879808.ingest.sentry.io/4504289338392576",
  attachScreenshot: true,
  //enabled: process.env.NODE_ENV === "production",
  release: "F1MV-Lights-Integration@" + app.getVersion(),
  environment: process.env.VITE_DEV_SERVER_URL ? "development" : "production",
  tracesSampleRate: 1.0,
  attachStacktrace: true,
  profilesSampleRate: 1.0,
  enableTracing: true,
  autoSessionTracking: true,
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

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

export let mainWindow: BrowserWindow | null = null;

export async function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "F1MV Lights Integration",
    icon: path.join(__dirname, "favicon.ico"),
    width: 1100,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      backgroundThrottling: false,
      nodeIntegration: true,
      contextIsolation: false,
    },
    resizable: true,
    maximizable: true,
    minimizable: true,
    minWidth: 900,
    minHeight: 750,
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  mainWindow.setMenuBarVisibility(false);

  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:" || "http:")) shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on(
    "will-navigate",
    (event: Electron.Event, url: string) => {
      if (url.startsWith("https:" || "http:") && !url.includes("localhost")) {
        event.preventDefault();
        shell.openExternal(url);
      }
    },
  );

  mainWindow.webContents.setZoomLevel(0);
}

let _configIPCCleanup: () => void;
let _updaterIPCCleanup: () => void;
let _utilsIPCCleanup: () => void;
let _loggerIPCCleanup: () => void;
let _appInfoIPCCleanup: () => void;
let _eventManagerIPCCleanup: () => void;
let _integrationsIPCCleanup: () => void;

app.whenReady().then(onReady);

function onReady() {
  createMainWindow();

  _configIPCCleanup = registerConfigIPCHandlers();
  _updaterIPCCleanup = registerUpdaterIPCHandlers();
  _utilsIPCCleanup = registerUtilsIPCHandlers();
  _loggerIPCCleanup = registerLoggerIPCHandlers();
  _appInfoIPCCleanup = registerAppInfoIPCHandlers();
  _eventManagerIPCCleanup = registerEventManagerIPCHandlers();
  _integrationsIPCCleanup = registerIntegrationsIPCHandlers();
  autoUpdater.forceDevUpdateConfig = false;
  autoUpdater.autoDownload = false;
  autoUpdater.disableWebInstaller = true;
  autoUpdater.allowDowngrade = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.autoRunAppAfterInstall = true;
  autoUpdater.channel = globalConfig.updateChannel;

  log.initialize({ preload: true });
  log.transports.console.level = false;
  if (process.env.VITE_DEV_SERVER_URL) {
    log.transports.console.level = globalConfig.debugMode ? "debug" : "info";
  }
  log.transports.file.level = globalConfig.debugMode ? "debug" : "info";

  log.info("App starting...");

  mainWindow?.webContents.setZoomLevel(0);
  mainWindow?.webContents.setZoomFactor(1);

  registerDeepLink();
  startLiveTimingDataPolling();
  fetchAuthoritativeConfig();
  setInterval(
    () => {
      fetchAuthoritativeConfig();
    },
    globalConfig.otaConfigFetchInterval +
      Math.random() * globalConfig.otaConfigFetchJitter,
  );
  initializeIntegrations();
  handleRegisterUser();
}

app.on("window-all-closed", async () => {
  await handleUserActiveExit();
  if (mqttClient && integrationStates.mqtt && globalConfig.mqttEnabled) {
    try {
      mqttClient?.publish(
        "F1MV-Lights-Integration/appState",
        JSON.stringify({
          appIsActive: false,
        }),
      );
      mqttClient?.end();
    } catch (err) {
      log.error(
        "Error while setting appIsActive to false, and closing the MQTT client: " +
          err.message,
      );
    }
  }

  mainWindow = null;

  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createMainWindow();
  }
});
