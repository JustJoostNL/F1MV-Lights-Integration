import { autoUpdater } from "electron-updater";
import log from "electron-log";

let updateFound = false;
let noUpdateFound = false;

export function initUpdater(win: Electron.BrowserWindow){
  autoUpdater.forceDevUpdateConfig = false;
  autoUpdater.autoDownload = false;
  autoUpdater.disableWebInstaller = true;
  autoUpdater.allowDowngrade = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.autoRunAppAfterInstall = true;
  autoUpdater.channel = "latest"; //todo: fetch this from config
  //autoUpdater.logger = log;

  autoUpdater.on("update-downloaded", () => {
    win.webContents.send("update-downloaded");
    autoUpdater.quitAndInstall(false, true);
  });

  autoUpdater.on("update-available", () => {
    updateFound = true;
    win.webContents.send("update-available");
    log.info("There is an update available. Downloading now... You will be notified when the update is ready to install.");
    downloadUpdate();
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

  function downloadUpdate(){
    try {
      autoUpdater.downloadUpdate().catch((e) => {
        win.webContents.send("update-error");
        log.error("An error occurred while downloading the update: " + e);
      });
    } catch (e) {
      win.webContents.send("update-error");
      log.error("An error occurred while downloading the update: " + e);
    }
  }
}
