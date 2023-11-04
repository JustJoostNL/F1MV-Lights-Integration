import { release } from "node:os";
import path, { join } from "node:path";
import http from "http";
import { app, BrowserWindow, shell } from "electron";
import log from "electron-log";
import portfinder from "portfinder";
import handler from "serve-handler";
import * as Sentry from "@sentry/electron";
import { initUpdater } from "./update";
import { registerConfigIPCHandlers } from "./ipc/config";
import { registerUpdaterIPCHandlers } from "./ipc/updater";
import { registerUtilsIPCHandlers } from "./ipc/utils";
import { registerLoggerIPCHandlers } from "./ipc/logger";

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

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

app.on("open-url", async (event) => {
  event.preventDefault();
  if (win) {
    win.show();
    win.focus();
  }
});

app.on("second-instance", async () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
  }
});

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

let win: BrowserWindow | null = null;
export let availablePort: number;
export const preload = path.join(__dirname, "../preload/index.js");
export const url = process.env.VITE_DEV_SERVER_URL;

async function createWindow() {
  win = new BrowserWindow({
    title: "F1MV Lights Integration",
    icon: join(process.env.PUBLIC, "favicon.ico"),
    width: 1200,
    height: 700,
    webPreferences: {
      preload,
      backgroundThrottling: false,
      nodeIntegration: true,
      contextIsolation: false,
    },
    resizable: true,
    maximizable: true,
    minimizable: false,
    minWidth: 1120,
    minHeight: 550,
  });

  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    await win.loadURL(url);
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
    });

  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:" || "http:")) shell.openExternal(url);
    return { action: "deny" };
  });

}

let _configIPCCleanup: () => void;
let _updaterIPCCleanup: () => void;
let _utilsIPCCleanup: () => void;
let _loggerIPCCleanup: () => void;

app.whenReady().then(onReady);

function onReady() {
  createWindow();
  win?.webContents.on("did-finish-load", () => {
    win?.webContents.insertCSS(
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
      `
    );
  });

  log.initialize({ preload: true });
  log.transports.console.level = false;
  if (process.env.VITE_DEV_SERVER_URL) {
    // todo: replace for debug mode
    if (win) {
      log.transports.console.level = "debug";
    } else {
      log.transports.console.level = "info";
    }
  }
  // todo: replace for debug mode
  if (win) {
    log.transports.file.level = "debug";
  } else {
    log.transports.file.level = "info";
  }

  log.info("App starting...");
  if (win) initUpdater(win);
  _configIPCCleanup = registerConfigIPCHandlers();
  _updaterIPCCleanup = registerUpdaterIPCHandlers();
  _utilsIPCCleanup = registerUtilsIPCHandlers();
  _loggerIPCCleanup = registerLoggerIPCHandlers();
  //initApp()
}

app.on("window-all-closed", () => {
  win = null;
  //analyticsHandler("activeUsersClose");

  // todo: add deconnections for integrations

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
