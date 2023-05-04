import { configVars } from "../../../config/config";
import {apiURLs, f1mvURLs, goveeVars} from "../../vars/vars";
import { integrationStates } from "../../vars/vars";
import log from "electron-log";
import fetch from "node-fetch";

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

  await fetch(apiURLs.liveSessionCheckURL).then((res) => res.json()).then((data) => {
    if (data.liveSessionFound){
      integrationStates.F1LiveSession = true;
      log.debug(data.message);
    } else {
      integrationStates.F1LiveSession = false;
      log.debug(data.message);
    }
  });

  try {
    await fetch(f1mvURLs.heartBeatURL).then((res) => res.json()).then((data) => {
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
  if (!configVars.goveeDisable && goveeVars.goveeInitialized && goveeVars.govee.devicesArray.length > 0) {
    integrationStates.goveeOnline = true;
  }
  if (!configVars.nanoLeafDisable){
    // todo
  }
  if (!configVars.WLEDDisable){
    // todo
  }
  if (!configVars.homeAssistantDisable){
    // todo
  }

  const states = [
    { name: "ikea", state: integrationStates.ikeaOnline },
    { name: "govee", state: integrationStates.goveeOnline },
    { name: "hue", state: integrationStates.hueOnline },
    { name: "openRGB", state: integrationStates.openRGBOnline },
    { name: "homeAssistant", state: integrationStates.homeAssistantOnline },
    { name: "yeelight", state: integrationStates.yeeLightOnline },
    { name: "streamDeck", state: integrationStates.streamDeckOnline },
    { name: "nanoLeaf", state: integrationStates.nanoLeafOnline },
    { name: "WLED", state: integrationStates.WLEDOnline },
    { name: "F1MV", state: integrationStates.F1MVAPIOnline },
    { name: "F1TVLiveSession", state: integrationStates.F1LiveSession },
    { name: "update", state: integrationStates.updateAPIOnline },
    { name: "webServer", state: integrationStates.webServerOnline }
  ];

  return states;
}