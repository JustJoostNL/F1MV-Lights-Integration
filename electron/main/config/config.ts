import Store from "electron-store";
import defaultConfig from "./defaultConfig";
import { configMigrations } from "./migrations";
import log from "electron-log";
import { configChangedEmitEvent } from "../index";
import createF1MVURLs from "../app/f1mv/createF1MVURLs";
import { goveeVars, ikeaVars, integrationStates, MQTTVars, webServerVars } from "../app/vars/vars";
import goveeInitialize from "../app/integrations/govee/goveeInit";
import homeAssistantInitialize from "../app/integrations/home-assistant/homeAssistantInit";
import webServerInitialize from "../app/integrations/webserver/webServerInit";
import streamDeckInitialize from "../app/integrations/elgato-streamdeck/streamDeckInit";
import ikeaInitialize from "../app/integrations/ikea/ikeaInit";
import ikeaCheckSpectrum from "../app/integrations/ikea/checkIkeaDeviceSpectrum";
import MQTTInitialize from "../app/integrations/mqtt/MQTTInit";

const userConfig = new Store({
  name: "settings",
  defaults: defaultConfig,
  watch: true,
  migrations: configMigrations
});

userConfig.onDidAnyChange(() => {
  log.debug("Config changed, reloading from config...");
  const newVariables = {
    "webServerDisable": userConfig.get("Settings.webServerSettings.webServerDisable"),
    "goveeDisable": userConfig.get("Settings.goveeSettings.goveeDisable"),
    "ikeaDisable": userConfig.get("Settings.ikeaSettings.ikeaDisable"),
    "ikeaDevices": userConfig.get("Settings.ikeaSettings.deviceIDs"),
    "homeAssistantDisable": userConfig.get("Settings.homeAssistantSettings.homeAssistantDisable"),
    "MQTTDisable": userConfig.get("Settings.MQTTSettings.MQTTDisable"),
    "MQTTHost": userConfig.get("Settings.MQTTSettings.host"),
    "MQTTPort": userConfig.get("Settings.MQTTSettings.port"),
    "MQTTUsername": userConfig.get("Settings.MQTTSettings.username"),
    "MQTTPassword": userConfig.get("Settings.MQTTSettings.password"),
    "streamDeckDisable": userConfig.get("Settings.streamDeckSettings.streamDeckDisable"),
    "debugMode": userConfig.get("Settings.advancedSettings.debugMode"),
  };
  const oldVariables = {
    "webServerDisable": configVars.webServerDisable,
    "goveeDisable": configVars.goveeDisable,
    "ikeaDisable": configVars.ikeaDisable,
    "ikeaDevices": configVars.ikeaDevices,
    "homeAssistantDisable": configVars.homeAssistantDisable,
    "MQTTDisable": configVars.MQTTDisable,
    "MQTTHost": configVars.MQTTHost,
    "MQTTPort": configVars.MQTTPort,
    "MQTTUsername": configVars.MQTTUsername,
    "MQTTPassword": configVars.MQTTPassword,
    "streamDeckDisable": configVars.streamDeckDisable,
    "debugMode": configVars.debugMode,
  };
  handleConfigChanges(newVariables, oldVariables);
  loadConfigInVars();
  createF1MVURLs();
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

export const handleConfigResetToDefault = async () => {
  await userConfig.reset("Settings");
  await loadConfigInVars();
  return true;
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
  hueBridgeIP: userConfig.get("Settings.hueSettings.hueBridgeIP") as string,
  hueDevices: userConfig.get("Settings.hueSettings.deviceIDs") as unknown[],
  hueEntertainmentZones: userConfig.get("Settings.hueSettings.entertainmentZoneIDs") as unknown[],
  hueToken: userConfig.get("Settings.hueSettings.token"),
  hueThirdPartyCompatMode: userConfig.get("Settings.hueSettings.hue3rdPartyCompatMode"),
  hueEnableFade: userConfig.get("Settings.hueSettings.enableFade"),
  hueEnableFadeWhenEffect: userConfig.get("Settings.hueSettings.enableFadeWithEffects"),

  // IKEA settings
  ikeaDisable: userConfig.get("Settings.ikeaSettings.ikeaDisable") as boolean,
  ikeaSecurityCode: userConfig.get("Settings.ikeaSettings.securityCode") as string,
  ikeaIdentity: userConfig.get("Settings.ikeaSettings.identity") as string,
  ikeaPsk: userConfig.get("Settings.ikeaSettings.psk") as string,
  ikeaDevices: userConfig.get("Settings.ikeaSettings.deviceIDs") as unknown[],

  // Govee settings
  goveeDisable: userConfig.get("Settings.goveeSettings.goveeDisable"),

  // OpenRGB settings
  openRGBDisable: userConfig.get("Settings.openRGBSettings.openRGBDisable"),
  openRGBHost: userConfig.get("Settings.openRGBSettings.openRGBServerIP") as string,
  openRGBPort: userConfig.get("Settings.openRGBSettings.openRGBServerPort") as number,

  // Home Assistant settings
  homeAssistantDisable: userConfig.get("Settings.homeAssistantSettings.homeAssistantDisable"),
  homeAssistantHost: userConfig.get("Settings.homeAssistantSettings.host"),
  homeAssistantPort: userConfig.get("Settings.homeAssistantSettings.port"),
  homeAssistantToken: userConfig.get("Settings.homeAssistantSettings.token"),
  homeAssistantDevices: userConfig.get("Settings.homeAssistantSettings.devices"),

  // WLED settings
  WLEDDisable: userConfig.get("Settings.WLEDSettings.WLEDDisable") as boolean,
  WLEDDevices: userConfig.get("Settings.WLEDSettings.devices") as string[],

  // MQTT Settings
  MQTTDisable: userConfig.get("Settings.MQTTSettings.MQTTDisable") as boolean,
  MQTTHost: userConfig.get("Settings.MQTTSettings.host") as string,
  MQTTPort: userConfig.get("Settings.MQTTSettings.port") as number,
  MQTTUsername: userConfig.get("Settings.MQTTSettings.username") as string | undefined,
  MQTTPassword: userConfig.get("Settings.MQTTSettings.password") as string | undefined,

  // Elgato Stream Deck Settings
  streamDeckDisable: userConfig.get("Settings.streamDeckSettings.streamDeckDisable"),

  // Discord Settings
  discordRPCDisable: userConfig.get("Settings.discordSettings.discordRPCDisable"),
  discordRPCAvoidSpoilers: userConfig.get("Settings.discordSettings.avoidSpoilers"),

  // Webserver Settings
  webServerDisable: userConfig.get("Settings.webServerSettings.webServerDisable"),
  webServerPort: userConfig.get("Settings.webServerSettings.webServerPort"),

  // Advanced Settings
  debugMode: userConfig.get("Settings.advancedSettings.debugMode"),
  updateChannel: userConfig.get("Settings.advancedSettings.updateChannel"),
  analyticsPreference: userConfig.get("Settings.advancedSettings.analytics"),

};


function handleConfigChanges(newVars, oldVars){

  if (!configVars.ikeaDisable && integrationStates.ikeaOnline){
    if (oldVars.ikeaDevices.some((id) => !newVars.ikeaDevices.includes(id)) || newVars.ikeaDevices.some((id) => !oldVars.ikeaDevices.includes(id))) {
      log.debug("Checking all the IKEA devices spectrum's again...");
      ikeaCheckSpectrum();
    }
  }

  if (oldVars.webServerDisable && !newVars.webServerDisable){
    log.info("Webserver enabled, starting...");
    webServerInitialize();
  } else if (!oldVars.webServerDisable && newVars.webServerDisable) {
    log.info("Webserver disabled, stopping...");
    webServerVars.webServerHTTPServer.close();
  }

  if (oldVars.goveeDisable && !newVars.goveeDisable) {
    log.debug("Govee integration enabled, starting...");
    goveeVars.govee = undefined;
    goveeInitialize();
  }

  if (oldVars.ikeaDisable && !newVars.ikeaDisable) {
    integrationStates.ikeaOnline = false;
    ikeaVars.allIkeaDevices = [];
    ikeaVars.colorDevices = [];
    ikeaVars.whiteDevices = [];
    ikeaInitialize();
  }

  if (oldVars.homeAssistantDisable && !newVars.homeAssistantDisable) {
    homeAssistantInitialize();
  }

  if (oldVars.streamDeckDisable && !newVars.streamDeckDisable) {
    streamDeckInitialize();
  }

  if (oldVars.MQTTDisable && !newVars.MQTTDisable) {
    MQTTInitialize();
  }

  if (!oldVars.MQTTDisable && newVars.MQTTDisable) {
    try {
      MQTTVars.client.publish("F1MV-Lights-Integration/appState", JSON.stringify({
        appIsActive: false,
      }));
      MQTTVars.client.end();
    } catch (e) {
      log.error("Error while setting appIsActive to false, and closing the MQTT client: " + e.message);
    }
  }
  // if (oldVars.MQTTUsername !== newVars.MQTTUsername || oldVars.MQTTPassword !== newVars.MQTTPassword || oldVars.MQTTHost !== newVars.MQTTHost || oldVars.MQTTPort !== newVars.MQTTPort) {
  //   if (!newVars.MQTTDisable) {
  //     try {
  //       MQTTVars.client.end();
  //     } catch (e) {
  //       log.error("Error while closing MQTT client: " + e.message);
  //     }
  //     MQTTInitialize();
  //   }
  // }


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

export function loadConfigInVars(){
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

  // WLED settings
  configVars.WLEDDisable = userConfig.get("Settings.WLEDSettings.WLEDDisable");
  configVars.WLEDDevices = userConfig.get("Settings.WLEDSettings.devices");

  // MQTT settings
  configVars.MQTTDisable = userConfig.get("Settings.MQTTSettings.MQTTDisable");
  configVars.MQTTHost = userConfig.get("Settings.MQTTSettings.host");
  configVars.MQTTPort = userConfig.get("Settings.MQTTSettings.port");
  configVars.MQTTUsername = userConfig.get("Settings.MQTTSettings.username");
  configVars.MQTTPassword = userConfig.get("Settings.MQTTSettings.password");

  // Elgato Stream Deck Settings
  configVars.streamDeckDisable = userConfig.get("Settings.streamDeckSettings.streamDeckDisable");

  // Discord Settings
  configVars.discordRPCDisable = userConfig.get("Settings.discordSettings.discordRPCDisable");
  configVars.discordRPCAvoidSpoilers = userConfig.get("Settings.discordSettings.avoidSpoilers");

  // Webserver Settings
  configVars.webServerDisable = userConfig.get("Settings.webServerSettings.webServerDisable");
  configVars.webServerPort = userConfig.get("Settings.webServerSettings.webServerPort");

  // Advanced Settings
  configVars.debugMode = userConfig.get("Settings.advancedSettings.debugMode");
  configVars.updateChannel = userConfig.get("Settings.advancedSettings.updateChannel");
  configVars.analyticsPreference = userConfig.get("Settings.advancedSettings.analytics");
}