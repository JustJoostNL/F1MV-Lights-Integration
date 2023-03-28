import Store from "electron-store";
import defaultConfig from "./defaultConfig";

const userConfig = new Store({
	name: "settings",
	defaults: defaultConfig,
	watch: true,
	migrations: {
		"2.0.0": userConfig => {
			userConfig.set("version", "2.0.0");
		}
	}
});

userConfig.onDidAnyChange(() => {
	console.log("Config changed, reloading config...");
	loadConfigInVars();
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

//-------------------------------------------

// general settings
export let autoTurnOffLights: boolean = userConfig.get("Settings.generalSettings.autoTurnOffLights");
export let defaultBrightness: number = userConfig.get("Settings.generalSettings.defaultBrightness");

// go back to static settings
export let goBackToStatic: boolean = userConfig.get("Settings.generalSettings.goBackToStatic");
export let goBackToStaticEnabledFlags: string[] = userConfig.get("Settings.generalSettings.goBackToStaticEnabledFlags");
export let goBackToStaticDelay: number = userConfig.get("Settings.generalSettings.goBackToStaticDelay");
export let staticBrightness: number = userConfig.get("Settings.generalSettings.staticBrightness");

// general settings
export let hideLogs: boolean = userConfig.get("Settings.generalSettings.hideLogs");

// color settings
export let staticColor: customColor = userConfig.get("Settings.generalSettings.colorSettings.staticColor");
export let greenColor: customColor = userConfig.get("Settings.generalSettings.colorSettings.green");
export let yellowColor: customColor = userConfig.get("Settings.generalSettings.colorSettings.yellow");
export let redColor: customColor = userConfig.get("Settings.generalSettings.colorSettings.red");
export let safetyCarColor: customColor = userConfig.get("Settings.generalSettings.colorSettings.safetyCar");
export let vscColor: customColor = userConfig.get("Settings.generalSettings.colorSettings.vsc");
export let vscEndingColor: customColor = userConfig.get("Settings.generalSettings.colorSettings.vscEnding");

// effect settings
export let effectSettings: object[] = userConfig.get("Settings.generalSettings.effectSettings");

// F1MV settings
export let F1MVURL: string = userConfig.get("Settings.MultiViewerForF1Settings.liveTimingURL");
export let f1mvSync: boolean = userConfig.get("Settings.MultiViewerForF1Settings.syncWithF1MV");

// Hue settings
export let hueDisable: boolean = userConfig.get("Settings.hueSettings.hueDisable");
export let hueBridgeIP: string | undefined = userConfig.get("Settings.hueSettings.hueBridgeIP");
export let hueDevices: string[] = userConfig.get("Settings.hueSettings.deviceIDs");
export let hueEntertainmentZones: string[] = userConfig.get("Settings.hueSettings.entertainmentZoneIDs");
export let hueToken: string | undefined = userConfig.get("Settings.hueSettings.token");
export let hueThirdPartyCompatMode: boolean = userConfig.get("Settings.hueSettings.hue3rdPartyCompatMode");
export let hueEnableFade: boolean = userConfig.get("Settings.hueSettings.enableFade");
export let hueEnableFadeWhenEffect: boolean = userConfig.get("Settings.hueSettings.enableFadeWithEffects");

// IKEA settings
export let ikeaDisable: boolean = userConfig.get("Settings.ikeaSettings.ikeaDisable");
export let ikeaSecurityCode: string = userConfig.get("Settings.ikeaSettings.securityCode");
export let ikeaIdentity: string | undefined = userConfig.get("Settings.ikeaSettings.identity");
export let ikeaPsk: string | undefined = userConfig.get("Settings.ikeaSettings.psk");
export let ikeaDevices: string[] = userConfig.get("Settings.ikeaSettings.deviceIDs");

// Govee settings
export let goveeDisable: boolean = userConfig.get("Settings.goveeSettings.goveeDisable");

// OpenRGB settings
export let openRGBDisable: boolean = userConfig.get("Settings.openRGBSettings.openRGBDisable");
export let openRGBHost: string = userConfig.get("Settings.openRGBSettings.openRGBServerIP");
export let openRGBPort: number = userConfig.get("Settings.openRGBSettings.openRGBServerPort");

// Home Assistant settings
export let homeAssistantDisable: boolean = userConfig.get("Settings.homeAssistantSettings.homeAssistantDisable");
export let homeAssistantHost: string = userConfig.get("Settings.homeAssistantSettings.host");
export let homeAssistantPort: number = userConfig.get("Settings.homeAssistantSettings.port");
export let homeAssistantToken: string = userConfig.get("Settings.homeAssistantSettings.token");
export let homeAssistantDevices: string[] = userConfig.get("Settings.homeAssistantSettings.devices");

// Nanoleaf settings
export let nanoLeafDisable: boolean = userConfig.get("Settings.nanoLeafSettings.nanoLeafDisable");
export let nanoLeafDevices: string[] = userConfig.get("Settings.nanoLeafSettings.devices");

// WLED settings
export let WLEDDisable: boolean = userConfig.get("Settings.WLEDSettings.WLEDDisable");
export let WLEDDevices: string[] = userConfig.get("Settings.WLEDSettings.devices");

// YeeLight settings
export let yeeLightDisable: boolean = userConfig.get("Settings.yeeLightSettings.yeeLightDisable");
export let yeeLightDevices: string[] = userConfig.get("Settings.yeeLightSettings.deviceIPs");

// Elgato Stream Deck Settings
export let streamDeckDisable: boolean = userConfig.get("Settings.streamDeckSettings.streamDeckDisable");

// Discord Settings
export let discordRPCDisable: boolean = userConfig.get("Settings.discordSettings.discordRPCDisable");

// Webserver Settings
export let webServerDisable: boolean = userConfig.get("Settings.webServerSettings.webServerDisable");
export let webServerPort: number = userConfig.get("Settings.webServerSettings.webServerPort");

// Advanced Settings
export let debugMode: boolean = userConfig.get("Settings.advancedSettings.debugMode");
export let updateChannel: string = userConfig.get("Settings.advancedSettings.updateChannel");
export let analyticsPreference: boolean = userConfig.get("Settings.advancedSettings.analytics");


function loadConfigInVars(){
	// general settings
	autoTurnOffLights = userConfig.get("Settings.generalSettings.autoTurnOffLights");
	defaultBrightness = userConfig.get("Settings.generalSettings.defaultBrightness");

	// go back to static settings
	goBackToStatic = userConfig.get("Settings.generalSettings.goBackToStatic");
	goBackToStaticEnabledFlags = userConfig.get("Settings.generalSettings.goBackToStaticEnabledFlags");
	goBackToStaticDelay = userConfig.get("Settings.generalSettings.goBackToStaticDelay");
	staticBrightness = userConfig.get("Settings.generalSettings.staticBrightness");

	// general settings
	hideLogs = userConfig.get("Settings.generalSettings.hideLogs");

	// color settings
	staticColor = userConfig.get("Settings.generalSettings.colorSettings.staticColor");
	greenColor = userConfig.get("Settings.generalSettings.colorSettings.green");
	yellowColor = userConfig.get("Settings.generalSettings.colorSettings.yellow");
	redColor = userConfig.get("Settings.generalSettings.colorSettings.red");
	safetyCarColor = userConfig.get("Settings.generalSettings.colorSettings.safetyCar");
	vscColor = userConfig.get("Settings.generalSettings.colorSettings.vsc");
	vscEndingColor = userConfig.get("Settings.generalSettings.colorSettings.vscEnding");

	// effect settings
	effectSettings = userConfig.get("Settings.generalSettings.effectSettings");

	// F1MV settings
	F1MVURL = userConfig.get("Settings.MultiViewerForF1Settings.liveTimingURL");
	f1mvSync = userConfig.get("Settings.MultiViewerForF1Settings.syncWithF1MV");

	// Hue settings
	hueDisable = userConfig.get("Settings.hueSettings.hueDisable");
	hueBridgeIP = userConfig.get("Settings.hueSettings.hueBridgeIP");
	hueDevices = userConfig.get("Settings.hueSettings.deviceIDs");
	hueEntertainmentZones = userConfig.get("Settings.hueSettings.entertainmentZoneIDs");
	hueToken = userConfig.get("Settings.hueSettings.token");
	hueThirdPartyCompatMode = userConfig.get("Settings.hueSettings.hue3rdPartyCompatMode");
	hueEnableFade = userConfig.get("Settings.hueSettings.enableFade");
	hueEnableFadeWhenEffect = userConfig.get("Settings.hueSettings.enableFadeWithEffects");

	// IKEA settings
	ikeaDisable = userConfig.get("Settings.ikeaSettings.ikeaDisable");
	ikeaSecurityCode = userConfig.get("Settings.ikeaSettings.securityCode");
	ikeaIdentity = userConfig.get("Settings.ikeaSettings.identity");
	ikeaPsk = userConfig.get("Settings.ikeaSettings.psk");
	ikeaDevices = userConfig.get("Settings.ikeaSettings.deviceIDs");

	// Govee settings
	goveeDisable = userConfig.get("Settings.goveeSettings.goveeDisable");

	// OpenRGB settings
	openRGBDisable = userConfig.get("Settings.openRGBSettings.openRGBDisable");
	openRGBHost = userConfig.get("Settings.openRGBSettings.openRGBServerIP");
	openRGBPort = userConfig.get("Settings.openRGBSettings.openRGBServerPort");

	// Home Assistant settings
	homeAssistantDisable = userConfig.get("Settings.homeAssistantSettings.homeAssistantDisable");
	homeAssistantHost = userConfig.get("Settings.homeAssistantSettings.host");
	homeAssistantPort = userConfig.get("Settings.homeAssistantSettings.port");
	homeAssistantToken = userConfig.get("Settings.homeAssistantSettings.token");
	homeAssistantDevices = userConfig.get("Settings.homeAssistantSettings.devices");

	// Nanoleaf settings
	nanoLeafDisable = userConfig.get("Settings.nanoLeafSettings.nanoLeafDisable");
	nanoLeafDevices = userConfig.get("Settings.nanoLeafSettings.devices");

	// WLED settings
	WLEDDisable = userConfig.get("Settings.WLEDSettings.WLEDDisable");
	WLEDDevices = userConfig.get("Settings.WLEDSettings.devices");

	// YeeLight settings
	yeeLightDisable = userConfig.get("Settings.yeeLightSettings.yeeLightDisable");
	yeeLightDevices = userConfig.get("Settings.yeeLightSettings.deviceIPs");

	// Elgato Stream Deck Settings
	streamDeckDisable = userConfig.get("Settings.streamDeckSettings.streamDeckDisable");

	// Discord Settings
	discordRPCDisable = userConfig.get("Settings.discordSettings.discordRPCDisable");

	// Webserver Settings
	webServerDisable = userConfig.get("Settings.webServerSettings.webServerDisable");
	webServerPort = userConfig.get("Settings.webServerSettings.webServerPort");

	// Advanced Settings
	debugMode = userConfig.get("Settings.advancedSettings.debugMode");
	updateChannel = userConfig.get("Settings.advancedSettings.updateChannel");
	analyticsPreference = userConfig.get("Settings.advancedSettings.analytics");
}