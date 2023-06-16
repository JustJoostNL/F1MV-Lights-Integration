import { configVars } from "../../../config/config";
import { apiURLs, MultiViewerURLs, goveeVars } from "../../vars/vars";
import { integrationStates } from "../../vars/vars";
import log from "electron-log";
import fetch from "node-fetch";
import homeAssistantOnlineCheck from "../home-assistant/homeAssistantOnlineCheck";

export async function handleMiscAPIChecks(){
  log.debug("Checking the update, F1 Live Session, and MultiViewer API...");

  await fetch(apiURLs.updateURL)
    .then(function () {
      integrationStates.updateAPIOnline = true;
      log.debug("Update API is online.");
    })
    .catch(function () {
      integrationStates.updateAPIOnline = false;
      log.debug("Update API is offline.");
    });

  try {
    await fetch(apiURLs.liveSessionCheckURL).then((res) => res.json()).then((data) => {
      if (data.liveSessionFound) {
        integrationStates.F1LiveSession = true;
        log.debug(data.message);
      } else {
        integrationStates.F1LiveSession = false;
        log.debug(data.message);
      }
    });
  } catch (error) {
    log.error("Error checking for F1TV Live Session: " + error.message);
  }

  try {
    await fetch(MultiViewerURLs.heartBeatURL).then((res) => res.json()).then((data) => {
      if (data.error !== "No data found, do you have live timing running?"){
        integrationStates.F1MVAPIOnline = true;
        log.debug("MultiViewer API is online.");
      } else {
        integrationStates.F1MVAPIOnline = false;
        log.debug("MultiViewer API is offline.");
      }
    });
  } catch (error) {
    integrationStates.F1MVAPIOnline = false;
    log.debug("MultiViewer API is offline.");
  }
}

export async function handleIntegrationStates(){
  if (!configVars.goveeDisable && goveeVars.goveeInitialized) {
    integrationStates.goveeOnline = goveeVars.govee.devicesArray.length > 0;
  }
  if (!configVars.homeAssistantDisable){
    await homeAssistantOnlineCheck();
  }
  if (!configVars.WLEDDisable){
    integrationStates.WLEDOnline = configVars.WLEDDevices.length > 0;
  }

  const states = [
    { name: "ikea", state: integrationStates.ikeaOnline, disabled: configVars.ikeaDisable },
    { name: "govee", state: integrationStates.goveeOnline, disabled: configVars.goveeDisable },
    { name: "hue", state: integrationStates.hueOnline, disabled: configVars.hueDisable },
    { name: "openRGB", state: integrationStates.openRGBOnline, disabled: configVars.openRGBDisable },
    { name: "homeAssistant", state: integrationStates.homeAssistantOnline, disabled: configVars.homeAssistantDisable },
    { name: "streamDeck", state: integrationStates.streamDeckOnline, disabled: configVars.streamDeckDisable },
    { name: "WLED", state: integrationStates.WLEDOnline, disabled: configVars.WLEDDisable },
    { name: "MQTT", state: integrationStates.MQTTOnline, disabled: configVars.MQTTDisable },
    { name: "F1MV", state: integrationStates.F1MVAPIOnline, disabled: false },
    { name: "F1TVLiveSession", state: integrationStates.F1LiveSession, disabled: false },
    { name: "update", state: integrationStates.updateAPIOnline, disabled: false },
    { name: "webServer", state: integrationStates.webServerOnline, disabled: configVars.webServerDisable },
  ];

  return states;
}