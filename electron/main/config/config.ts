import Store from "electron-store";
import defaultConfig from "./defaultConfig";
import { configMigrations } from "./migrations";
import log from "electron-log";
import {configChangedEmitEvent} from "../index";
import createF1MVURLs from "../app/f1mv/createF1MVURLs";
import {goveeVars, integrationStates} from "../app/vars/vars";
import goveeInitialize from "../app/integrations/govee/goveeInit";

const userConfig = new Store({
  name: "settings",
  defaults: defaultConfig,
  watch: true,
  migrations: {
    configMigrations
  }
});

userConfig.onDidAnyChange(() => {
  log.info("Config changed, reloading from config...");
  const newVariables = {
    "webServerDisable": userConfig.get("Settings.webServerSettings.webServerDisable"),
    "goveeDisable": userConfig.get("Settings.goveeSettings.goveeDisable"),
    "ikeaDisable": userConfig.get("Settings.ikeaSettings.ikeaDisable"),
    "homeAssistantDisable": userConfig.get("Settings.homeAssistantSettings.homeAssistantDisable"),
    "debugMode": userConfig.get("Settings.advancedSettings.debugMode"),
  }
  const oldVariables = {
    "webServerDisable": configVars.webServerDisable,
    "goveeDisable": configVars.goveeDisable,
    "ikeaDisable": configVars.ikeaDisable,
    "homeAssistantDisable": configVars.homeAssistantDisable,
    "debugMode": configVars.debugMode,
  }
  handleConfigChanges(newVariables, oldVariables);
  loadConfigInVars();
  configChangedEmitEvent();
});

export const handleConfigSet = (event, key, value) => {
  userConfig.set(key, value);
};
export const handleConfigGet = (event, key) => {
  return userConfig.get(key);
};

export const handleConfigGetAll = async () => {
  return userConfig.store;
};

export const handleConfigOpenInEditor = () => {
  userConfig.openInEditor();
};

export const configVars = {
  // general settings
  autoTurnOffLights: userConfig.get("Settings.generalSettings.autoTurnOffLights"),
  defaultBrightness: userConfig.get("Settings.generalSettings.defaultBrightness"),

  // go back to static settings
  goBackToStatic: userConfig.get("Settings.generalSettings.goBackToStatic"),
  goBackToStaticEnabledFlags: userConfig.get("Settings.generalSettings.goBackToStaticEnabledFlags"),
  goBackToStaticDelay: userConfig.get("Settings.generalSettings.goBackToStaticDelay"),
  staticBrightness: userConfig.get("Settings.generalSettings.staticBrightness"),

  // general settings
  hideLogs: userConfig.get("Settings.generalSettings.hideLogs"),

  // color settings
  staticColor: userConfig.get("Settings.generalSettings.colorSettings.staticColor"),
  greenColor: userConfig.get("Settings.generalSettings.colorSettings.green"),
  yellowColor: userConfig.get("Settings.generalSettings.colorSettings.yellow"),
  redColor: userConfig.get("Settings.generalSettings.colorSettings.red"),
  safetyCarColor: userConfig.get("Settings.generalSettings.colorSettings.safetyCar"),
  vscColor: userConfig.get("Settings.generalSettings.colorSettings.vsc"),
  vscEndingColor: userConfig.get("Settings.generalSettings.colorSettings.vscEnding"),

  // effect settings
  effectSettings: userConfig.get("Settings.generalSettings.effectSettings"),

  // F1MV settings
  F1MVURL: userConfig.get("Settings.MultiViewerForF1Settings.liveTimingURL"),
  f1mvSync: userConfig.get("Settings.MultiViewerForF1Settings.f1mvCheck"),

  // Hue settings
  hueDisable: userConfig.get("Settings.hueSettings.hueDisable"),
  hueBridgeIP: userConfig.get("Settings.hueSettings.hueBridgeIP"),
  hueDevices: userConfig.get("Settings.hueSettings.deviceIDs"),
  hueEntertainmentZones: userConfig.get("Settings.hueSettings.entertainmentZoneIDs"),
  hueToken: userConfig.get("Settings.hueSettings.token"),
  hueThirdPartyCompatMode: userConfig.get("Settings.hueSettings.hue3rdPartyCompatMode"),
  hueEnableFade: userConfig.get("Settings.hueSettings.enableFade"),
  hueEnableFadeWhenEffect: userConfig.get("Settings.hueSettings.enableFadeWithEffects"),

  // IKEA settings
  ikeaDisable: userConfig.get("Settings.ikeaSettings.ikeaDisable"),
  ikeaSecurityCode: userConfig.get("Settings.ikeaSettings.securityCode"),
  ikeaIdentity: userConfig.get("Settings.ikeaSettings.identity"),
  ikeaPsk: userConfig.get("Settings.ikeaSettings.psk"),
  ikeaDevices: userConfig.get("Settings.ikeaSettings.deviceIDs"),

  // Govee settings
  goveeDisable: userConfig.get("Settings.goveeSettings.goveeDisable"),

  // OpenRGB settings
  openRGBDisable: userConfig.get("Settings.openRGBSettings.openRGBDisable"),
  openRGBHost: userConfig.get("Settings.openRGBSettings.openRGBServerIP"),
  openRGBPort: userConfig.get("Settings.openRGBSettings.openRGBServerPort"),

  // Home Assistant settings
  homeAssistantDisable: userConfig.get("Settings.homeAssistantSettings.homeAssistantDisable"),
  homeAssistantHost: userConfig.get("Settings.homeAssistantSettings.host"),
  homeAssistantPort: userConfig.get("Settings.homeAssistantSettings.port"),
  homeAssistantToken: userConfig.get("Settings.homeAssistantSettings.token"),
  homeAssistantDevices: userConfig.get("Settings.homeAssistantSettings.devices"),

  // Nanoleaf settings
  nanoLeafDisable: userConfig.get("Settings.nanoLeafSettings.nanoLeafDisable"),
  nanoLeafDevices: userConfig.get("Settings.nanoLeafSettings.devices"),

  // WLED settings
  WLEDDisable: userConfig.get("Settings.WLEDSettings.WLEDDisable"),
  WLEDDevices: userConfig.get("Settings.WLEDSettings.devices"),

  // YeeLight settings
  yeeLightDisable: userConfig.get("Settings.yeeLightSettings.yeeLightDisable"),
  yeeLightDevices: userConfig.get("Settings.yeeLightSettings.deviceIPs"),

  // Elgato Stream Deck Settings
  streamDeckDisable: userConfig.get("Settings.streamDeckSettings.streamDeckDisable"),

  // Discord Settings
  discordRPCDisable: userConfig.get("Settings.discordSettings.discordRPCDisable"),

  // Webserver Settings
  webServerDisable: userConfig.get("Settings.webServerSettings.webServerDisable"),
  webServerPort: userConfig.get("Settings.webServerSettings.webServerPort"),

  // Advanced Settings
  debugMode: userConfig.get("Settings.advancedSettings.debugMode"),
  updateChannel: userConfig.get("Settings.advancedSettings.updateChannel"),
  analyticsPreference: userConfig.get("Settings.advancedSettings.analytics"),

};


function handleConfigChanges(newVars, oldVars){
  createF1MVURLs();

  if (!configVars.ikeaDisable && integrationStates.ikeaOnline){
    log.debug("Checking all the IKEA devices spectrum's again...")
    // todo: check ikea spectrum
  }

  if (oldVars.webServerDisable && !newVars.webServerDisable){
    log.info("Webserver enabled, starting...");
    // todo: start webserver
  } else if (!oldVars.webServerDisable && newVars.webServerDisable) {
    log.info("Webserver disabled, stopping...");
    // todo: stop webserver
  }

  if (oldVars.goveeDisable && !newVars.goveeDisable) {
    log.debug("Govee integration enabled, starting...");
    goveeVars.govee = undefined;
    goveeInitialize();
  }

  if (oldVars.ikeaDisable && !newVars.ikeaDisable) {
    integrationStates.ikeaOnline = false;
    //todo: clear devices + init again
    //allIkeaDevices = [];
    //colorDevices = [];
    //whiteDevices = [];

    //ikeaInitialize();
  }

  if (oldVars.homeAssistantDisable && !newVars.homeAssistantDisable) {
    // todo: init again
    //homeAssistantInitialize();
  }

  if (oldVars.debugMode && !newVars.debugMode) {
    log.transports.file.level = "info";
    if (process.env.VITE_DEV_SERVER_URL){
      log.transports.console.level = "info";
    }
  } else if (!oldVars.debugMode && newVars.debugMode) {
    log.transports.file.level = "debug";
    if (process.env.VITE_DEV_SERVER_URL){
      log.transports.console.level = "debug";
    }
  }

}

function loadConfigInVars(){
  // general settings
  configVars.autoTurnOffLights = userConfig.get("Settings.generalSettings.autoTurnOffLights");
  configVars.defaultBrightness = userConfig.get("Settings.generalSettings.defaultBrightness");

  // go back to static settings
  configVars.goBackToStatic = userConfig.get("Settings.generalSettings.goBackToStatic");
  configVars.goBackToStaticEnabledFlags = userConfig.get("Settings.generalSettings.goBackToStaticEnabledFlags");
  configVars.goBackToStaticDelay = userConfig.get("Settings.generalSettings.goBackToStaticDelay");
  configVars.staticBrightness = userConfig.get("Settings.generalSettings.staticBrightness");

  // general settings
  configVars.hideLogs = userConfig.get("Settings.generalSettings.hideLogs");

  // color settings
  configVars.staticColor = userConfig.get("Settings.generalSettings.colorSettings.staticColor");
  configVars.greenColor = userConfig.get("Settings.generalSettings.colorSettings.green");
  configVars.yellowColor = userConfig.get("Settings.generalSettings.colorSettings.yellow");
  configVars.redColor = userConfig.get("Settings.generalSettings.colorSettings.red");
  configVars.safetyCarColor = userConfig.get("Settings.generalSettings.colorSettings.safetyCar");
  configVars.vscColor = userConfig.get("Settings.generalSettings.colorSettings.vsc");
  configVars.vscEndingColor = userConfig.get("Settings.generalSettings.colorSettings.vscEnding");

  // effect settings
  configVars.effectSettings = userConfig.get("Settings.generalSettings.effectSettings");

  // F1MV settings
  configVars.F1MVURL = userConfig.get("Settings.MultiViewerForF1Settings.liveTimingURL");
  configVars.f1mvSync = userConfig.get("Settings.MultiViewerForF1Settings.f1mvCheck");

  // Hue settings
  configVars.hueDisable = userConfig.get("Settings.hueSettings.hueDisable");
  configVars.hueBridgeIP = userConfig.get("Settings.hueSettings.hueBridgeIP");
  configVars.hueDevices = userConfig.get("Settings.hueSettings.deviceIDs");
  configVars.hueEntertainmentZones = userConfig.get("Settings.hueSettings.entertainmentZoneIDs");
  configVars.hueToken = userConfig.get("Settings.hueSettings.token");
  configVars.hueThirdPartyCompatMode = userConfig.get("Settings.hueSettings.hue3rdPartyCompatMode");
  configVars.hueEnableFade = userConfig.get("Settings.hueSettings.enableFade");
  configVars.hueEnableFadeWhenEffect = userConfig.get("Settings.hueSettings.enableFadeWithEffects");

  // IKEA settings
  configVars.ikeaDisable = userConfig.get("Settings.ikeaSettings.ikeaDisable");
  configVars.ikeaSecurityCode = userConfig.get("Settings.ikeaSettings.securityCode");
  configVars.ikeaIdentity = userConfig.get("Settings.ikeaSettings.identity");
  configVars.ikeaPsk = userConfig.get("Settings.ikeaSettings.psk");
  configVars.ikeaDevices = userConfig.get("Settings.ikeaSettings.deviceIDs");
  // Govee settings
  configVars.goveeDisable = userConfig.get("Settings.goveeSettings.goveeDisable");

  // OpenRGB settings
  configVars.openRGBDisable = userConfig.get("Settings.openRGBSettings.openRGBDisable");
  configVars.openRGBHost = userConfig.get("Settings.openRGBSettings.openRGBServerIP");
  configVars.openRGBPort = userConfig.get("Settings.openRGBSettings.openRGBServerPort");

  // Home Assistant settings
  configVars.homeAssistantDisable = userConfig.get("Settings.homeAssistantSettings.homeAssistantDisable");
  configVars.homeAssistantHost = userConfig.get("Settings.homeAssistantSettings.host");
  configVars.homeAssistantPort = userConfig.get("Settings.homeAssistantSettings.port");
  configVars.homeAssistantToken = userConfig.get("Settings.homeAssistantSettings.token");
  configVars.homeAssistantDevices = userConfig.get("Settings.homeAssistantSettings.devices");

  // Nanoleaf settings
  configVars.nanoLeafDisable = userConfig.get("Settings.nanoLeafSettings.nanoLeafDisable");
  configVars.nanoLeafDevices = userConfig.get("Settings.nanoLeafSettings.devices");

  // WLED settings
  configVars.WLEDDisable = userConfig.get("Settings.WLEDSettings.WLEDDisable");
  configVars.WLEDDevices = userConfig.get("Settings.WLEDSettings.devices");

  // YeeLight settings
  configVars.yeeLightDisable = userConfig.get("Settings.yeeLightSettings.yeeLightDisable");
  configVars.yeeLightDevices = userConfig.get("Settings.yeeLightSettings.deviceIPs");

  // Elgato Stream Deck Settings
  configVars.streamDeckDisable = userConfig.get("Settings.streamDeckSettings.streamDeckDisable");

  // Discord Settings
  configVars.discordRPCDisable = userConfig.get("Settings.discordSettings.discordRPCDisable");

  // Webserver Settings
  configVars.webServerDisable = userConfig.get("Settings.webServerSettings.webServerDisable");
  configVars.webServerPort = userConfig.get("Settings.webServerSettings.webServerPort");

  // Advanced Settings
  configVars.debugMode = userConfig.get("Settings.advancedSettings.debugMode");
  configVars.updateChannel = userConfig.get("Settings.advancedSettings.updateChannel");
  configVars.analyticsPreference = userConfig.get("Settings.advancedSettings.analytics");
}