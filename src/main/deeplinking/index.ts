import path from "path";
import { app, ipcMain } from "electron";
import { createMainWindow, mainWindow } from "../main";
import {
  handleAddEvent,
  handleOpenWhitelisted,
  handlePatchConfig,
} from "./app";

interface IRoute {
  host: string;
  match: RegExp;
  handler: (uri: URL, groups: RegExpMatchArray | null) => void;
}

const protocols = ["f1mvlightsintegration", "f1mvli", "f1mvlights"];
const uriRegex = new RegExp(`^(${protocols.join("|")})://(.*)$`);

const router: IRoute[] = [
  {
    host: "app",
    match: /^\/settings/i,
    handler: handleOpenWhitelisted,
  },
  {
    host: "app",
    match: /^\/config\/patch/i,
    handler: handlePatchConfig,
  },
  {
    host: "app",
    match: /^\/event-editor/i,
    handler: handleOpenWhitelisted,
  },
  {
    host: "app",
    match: /^\/config\/add-event/i,
    handler: handleAddEvent,
  },
];

function handleOpenURL(event: Electron.Event | undefined, url: string) {
  event?.preventDefault();

  const uri = new URL(url);
  const { pathname, host } = uri;

  const route = router.find((r) => r.host === host && r.match.test(pathname));
  if (!route) return;

  route.handler(uri, pathname.match(route.match));
}

function handleSecondInstance(event: Electron.Event, argv: string[]) {
  if (process.platform === "win32" || process.platform === "linux") {
    const uri = argv.find((arg) => uriRegex.test(arg));
    if (uri) handleOpenURL(event, uri);
  }

  if (!mainWindow) createMainWindow();
  if (mainWindow?.isMinimized()) mainWindow.restore();

  mainWindow?.focus();
}

export function handleDeepLink(argv: string[]) {
  const uri = argv.find((arg) => uriRegex.test(arg));
  if (uri) handleOpenURL(undefined, uri);
}

export function registerDeepLink() {
  try {
    if (process.env.NODE_ENV !== "development") {
      if (process.defaultApp) {
        if (process.argv.length >= 2) {
          protocols.forEach((protocol) => {
            console.log(process.execPath, process.argv);
            app.setAsDefaultProtocolClient(protocol, process.execPath, [
              path.resolve(process.argv[1]),
            ]);
          });
        }
      } else {
        protocols.forEach((protocol) => {
          app.setAsDefaultProtocolClient(protocol);
        });
      }
    }

    app.on("open-url", handleOpenURL);
    app.on("second-instance", handleSecondInstance);

    ipcMain.handle("f1mvli:deep-link:open-url", handleOpenURL);
  } catch (e: any) {
    console.error("Failed to register F1MV Lights Integration protocol:", e);
  }

  return () => {
    app.off("open-url", handleOpenURL);
    app.off("second-instance", handleSecondInstance);

    ipcMain.removeHandler("f1mvli:deep-link:open-url");

    protocols.forEach((protocol) => {
      app.removeAsDefaultProtocolClient(protocol);
    });
  };
}
