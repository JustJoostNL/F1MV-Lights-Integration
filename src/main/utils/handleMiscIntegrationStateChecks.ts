import log from "electron-log";
import { integrationStates } from "../lightController/integrations/states";

export const baseURL = "https://api.jstt.me/api/v2";
export const apiUrls = {
  updateURL: `${baseURL}/github/repos/JustJoostNL/F1MV-Lights-Integration/releases`,
  liveSessionCheckURL: `${baseURL}/f1tv/live-session`,
};

export async function handleMiscIntegrationStateChecks() {
  await fetch(apiUrls.updateURL)
    .then(function () {
      integrationStates.autoUpdater = true;
      log.debug("AutoUpdater API is online.");
    })
    .catch(function () {
      integrationStates.autoUpdater = false;
      log.debug("AutoUpdater API is offline.");
    });

  await fetch(apiUrls.liveSessionCheckURL)
    .then((res) => res.json())
    .then((data) => {
      if (data.liveSessionFound) {
        integrationStates.f1tvLiveSession = true;
      } else {
        integrationStates.f1tvLiveSession = false;
      }
    });
}
