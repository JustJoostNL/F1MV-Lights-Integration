import { autoUpdater, UpdateDownloadedEvent } from "electron-updater";
import { configVars } from "./config/config";
import { dialog } from "electron";
import log from "electron-log";

let updateFound = false;
let noUpdateFound = false;

export default function initUpdater(){
  autoUpdater.autoDownload = false;
  autoUpdater.disableWebInstaller = false;
  autoUpdater.allowDowngrade = false;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.channel = <string>configVars.updateChannel;
  autoUpdater.logger = log;

  autoUpdater.on("update-downloaded", (event: UpdateDownloadedEvent) => {
    const dialogOpts = {
      type: "info",
      buttons: ["Restart", "Later"],
      title: "Update Available",
      message: "Update Available",
      detail: "A new version has been downloaded. Restart the application to apply the updates.",
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall();
    });
  });

  autoUpdater.on("update-available", () => {
    updateFound = true;
    log.info("There is an update available. Downloading now... You will be notified when the update is ready to install.");
  });
  autoUpdater.on("update-not-available", () => {
    if(!noUpdateFound){
      noUpdateFound = true;
      log.info("There are no updates available.");
    }
  });
  autoUpdater.on("error", (err) => {
    log.error("An error occurred in the update process: " + err);
  });

  setInterval(() => {
    if (!updateFound) {
      autoUpdater.checkForUpdates();
    }
  }, 30000);
}