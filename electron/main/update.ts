import { autoUpdater, UpdateDownloadedEvent } from "electron-updater";
import { configVars } from "./config/config";
import { dialog } from "electron";
import log from "electron-log";

let updateFound = false;
let noUpdateFound = false;

export default function initUpdater(win: Electron.BrowserWindow){
  autoUpdater.forceDevUpdateConfig = true;
  autoUpdater.autoDownload = false;
  autoUpdater.disableWebInstaller = true;
  autoUpdater.allowDowngrade = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.autoRunAppAfterInstall = true;
  autoUpdater.channel = <string>configVars.updateChannel;
  //autoUpdater.logger = log;

  autoUpdater.on("update-downloaded", (event: UpdateDownloadedEvent) => {
    win.webContents.send("update-downloaded");
    //autoUpdater.quitAndInstall(false, true)
  });

  autoUpdater.on("update-available", () => {
    updateFound = true;
    win.webContents.send("update-available");
    log.info("There is an update available. Downloading now... You will be notified when the update is ready to install.");
    try {
      autoUpdater.downloadUpdate()
    } catch (e) {
      log.error("An error occurred while downloading the update: " + e);
    }
  });
  autoUpdater.on("update-not-available", () => {
    if(!noUpdateFound){
      noUpdateFound = true;
      log.info("There are no updates available.");
    }
  });
  autoUpdater.on("error", (err) => {
    win.webContents.send("update-error");
    log.error("An error occurred in the update process: " + err);
  });

  setInterval(() => {
    if (!updateFound) {
      try {
        autoUpdater.checkForUpdates();
      } catch (e) {
        log.error("An error occurred while checking for updates: " + e);
      }
    }
  }, 60000);
}