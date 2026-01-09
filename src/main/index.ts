import { release } from "node:os";
import path, { join } from "node:path";
import http from "http";
import { app, BrowserWindow, shell } from "electron";
import log from "electron-log";
import portfinder from "portfinder";
import handler from "serve-handler";
import * as Sentry from "@sentry/electron/main";
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
import { registerEventManagerIPCHandlers } from "./ipc/eventManager";
import { registerIntegrationManagerIPCHandlers } from "./ipc/integrationManager";
import { initializeIntegrations } from "./initializeApp";
import { UserAnalytics } from "./analytics";
import { registerDeepLink } from "./deeplinking";
import { integrationManager } from "./integrations/IntegrationManager";

Sentry.init({
  dsn: "https://e64c3ec745124566b849043192e58711@o4504289317879808.ingest.sentry.io/4504289338392576",
  attachScreenshot: true,
  //enabled: process.env.NODE_ENV === "production",
  release: "F1MV-Lights-Integration@" + app.getVersion(),
  environment: process.env.VITE_DEV_SERVER_URL ? "development" : "production",
  tracesSampleRate: 1.0,
  attachStacktrace: true,
  profilesSampleRate: 1.0,
});

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

process.env.DIST_ELECTRON = join(__dirname, "../");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

// Remove electron security warnings
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

export let mainWindow: BrowserWindow | null = null;
export let availablePort: number | null = null;
export const preload = path.join(__dirname, "../preload/index.js");
export const devServerUrl = process.env.VITE_DEV_SERVER_URL;

export async function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "F1MV Lights Integration",
    icon: join(process.env.PUBLIC, "favicon.ico"),
    width: 1100,
    height: 800,
    webPreferences: {
      preload,
      backgroundThrottling: false,
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
    resizable: true,
    maximizable: true,
    minimizable: true,
    minWidth: 900,
    minHeight: 750,
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools({ mode: "detach" });
    mainWindow.setMenuBarVisibility(false);
  } else {
    mainWindow.setMenuBarVisibility(false);
    availablePort = await portfinder.getPortPromise({
      port: 30303,
      host: "localhost",
    });
    const server = http.createServer((request, response) => {
      return handler(request, response, {
        public: process.env.DIST,
      });
    });
    server.listen(availablePort, () => {
      mainWindow?.loadURL(`http://localhost:${availablePort}/index.html`);
    });
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  mainWindow.webContents.on(
    "will-navigate",
    (event: Electron.Event, url: string) => {
      if (
        (url.startsWith("http:") || url.startsWith("https:")) &&
        !url.includes("localhost")
      ) {
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
let _integrationManagerIPCCleanup: () => void;

app.whenReady().then(onReady);

function onReady() {
  createMainWindow();

  _configIPCCleanup = registerConfigIPCHandlers();
  _updaterIPCCleanup = registerUpdaterIPCHandlers();
  _utilsIPCCleanup = registerUtilsIPCHandlers();
  _loggerIPCCleanup = registerLoggerIPCHandlers();
  _appInfoIPCCleanup = registerAppInfoIPCHandlers();
  _eventManagerIPCCleanup = registerEventManagerIPCHandlers();
  _integrationManagerIPCCleanup = registerIntegrationManagerIPCHandlers();
  autoUpdater.forceDevUpdateConfig = false;
  autoUpdater.autoDownload = false;
  autoUpdater.disableWebInstaller = true;
  autoUpdater.allowDowngrade = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.autoRunAppAfterInstall = true;
  autoUpdater.channel = "latest";

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
  fetchAuthoritativeConfig();
  setInterval(
    fetchAuthoritativeConfig,
    globalConfig.otaConfigFetchInterval +
      Math.random() * globalConfig.otaConfigFetchJitter,
  );
  initializeIntegrations();
  UserAnalytics.startAnalytics();

  if (globalConfig.startMultiViewerWhenAppStarts) {
    shell.openExternal("multiviewer://");
  }
}

app.on("window-all-closed", async () => {
  await UserAnalytics.stopAnalytics();
  await integrationManager.shutdownAll();

  mainWindow = null;

  app.quit();
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createMainWindow();
  }
  UserAnalytics.startAnalytics();
});

app.on("before-quit", async (event) => {
  event.preventDefault();
  await UserAnalytics.stopAnalytics();
  app.exit();
});
