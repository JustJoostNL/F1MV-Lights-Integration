"use strict";
let testBuild = false;
let testMode = false;
const {
	app,
	dialog,
	ipcMain
} = require("electron");
const BrowserWindow = require("electron").BrowserWindow;
const electronLocalShortcut = require("electron-localshortcut");
const {
	autoUpdater
} = require("electron-updater");
const process = require("process");
const path = require("path");
const Store = require("electron-store");
const {
	Bulb
} = require("yeelight.io");
const configDefault = require("../config/config");
const userConfig = new Store({
	name: "settings",
	defaults: configDefault,
	beforeEachMigration: (store, context) => {
		console.log(`Migrating the config from ${context.fromVersion} → ${context.toVersion}`);

	},
	migrations: {
		"1.1.7": userConfig => {
			userConfig.set("version", "1.1.7");
			// new settings:
			userConfig.set("Settings.generalSettings.goBackToStatic", true);
			userConfig.set("Settings.generalSettings.goBackToStaticDelay", 10);
			userConfig.set("Settings.generalSettings.staticBrightness", 70);
			userConfig.set("Settings.generalSettings.colorSettings.staticColor", {
				r: 255,
				g: 255,
				b: 255
			});
		},
		"1.1.8": userConfig => {
		    userConfig.set("version", "1.1.8");
			userConfig.set("Settings.hueSettings.enableFade", false);
			userConfig.set("Settings.generalSettings.effectSettings", [
				{
					name: "VSC Blink Effect",
					onFlag: "vscEnding",
					enabled: true,
					actions: [
						{
							type: "on",
							color: {
								r: 0,
								g: 255,
								b: 0
							},
							brightness: 100,
						},
						{
							type: "delay",
							delay: 500,
						},
						{
							type: "on",
							color: {
								r: 255,
								g: 150,
								b: 0
							},
							brightness: 100,
						},
						{
							type: "delay",
							delay: 500,
						}
					],
					amount: 5
				}
			]);
		},
		"1.1.9": userConfig => {
			userConfig.set("version", "1.1.9");
			userConfig.set("Settings.homeAssistantSettings", {
				homeAssistantDisable: true,
				host: "",
				port: 8123,
				token: "",
				devices: []
			});
			userConfig.set("Settings.hueSettings.enableFadeWithEffects", false);
			userConfig.set("Settings.generalSettings.goBackToStaticEnabledFlags", [
				"green",
			]);
		},
	}
});


async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

const Tradfri = require("node-tradfri-client");

const { ColorTranslator } = require("colortranslator");

let debugPreference = userConfig.get("Settings.advancedSettings.debugMode");
let f1mvRawURL = userConfig.get("Settings.MultiViewerForF1Settings.liveTimingURL");
let f1mvURL;
let f1mvCheckURL;
function createF1MVURLs() {
	if (f1mvRawURL.endsWith("/")) {
		f1mvRawURL = f1mvRawURL.slice(0, -1);
	}
	if (f1mvRawURL === "http://localhost:10101") {
		f1mvRawURL = "http://127.0.0.1:10101";
	}
	f1mvURL = f1mvRawURL + "/api/graphql";
	f1mvCheckURL = f1mvRawURL + "/api/v1/live-timing/Heartbeat";
}
createF1MVURLs();
let ikeaDisabled = userConfig.get("Settings.ikeaSettings.ikeaDisable");
let goveeDisabled = userConfig.get("Settings.goveeSettings.goveeDisable");
let yeelightDisabled = userConfig.get("Settings.yeeLightSettings.yeeLightDisable");
let hueDisabled = userConfig.get("Settings.hueSettings.hueDisable");
let nanoLeafDisabled = userConfig.get("Settings.nanoLeafSettings.nanoLeafDisable");
let openRGBDisabled = userConfig.get("Settings.openRGBSettings.openRGBDisable");
let streamDeckDisabled = userConfig.get("Settings.streamDeckSettings.streamDeckDisable");
let webServerDisabled = userConfig.get("Settings.webServerSettings.webServerDisable");
let webServerPort = userConfig.get("Settings.webServerSettings.webServerPort");
let webServerOnline = false;

let discordRPCDisabled = userConfig.get("Settings.discordSettings.discordRPCDisable");

let ikeaSecurityCode = userConfig.get("Settings.ikeaSettings.securityCode");
let ikeaIdentity = userConfig.get("Settings.ikeaSettings.identity");
let ikeaPSK = userConfig.get("Settings.ikeaSettings.psk");

let Govee;
let govee;
let goveeInitialized = false;

let WLEDDisabled = userConfig.get("Settings.WLEDSettings.WLEDDisable");
let WLEDDeviceIPs = userConfig.get("Settings.WLEDSettings.devices");

let analyticsPreference = userConfig.get("Settings.advancedSettings.analytics");
const APIURL = "https://api.joost.systems/api/v2";
let analyticsSent = false;

let updateChannel = userConfig.get("Settings.advancedSettings.updateChannel");
autoUpdater.channel = updateChannel;
autoUpdater.autoInstallOnAppQuit = false;
const updateURL = APIURL + "/github/repos/JustJoostNL/f1mv-lights-integration/releases";

let userBrightness = parseInt(userConfig.get("Settings.generalSettings.defaultBrightness"));

let devMode = false;
let ikeaOnline = false;
let goveeOnline = false;
let hueOnline = false;
let nanoLeafOnline = false;
let openRGBOnline = false;
let homeAssistantOnline = false;
let streamDeckOnline = false;
let WLEDOnline = false;

let f1LiveSession = false;
let f1mvAPIOnline = false;
let updateAPIOnline = false;

let colorDevices = [];
let whiteDevices = [];
let TState;
let SState;
let SInfo;
let TStateCheck;
let SStateCheck;
let win;
let f1mvCheck = userConfig.get("Settings.MultiViewerForF1Settings.f1mvCheck");
const alwaysFalse = false;

let hideLogs = userConfig.get("Settings.generalSettings.hideLogs");

let effectSettings = userConfig.get("Settings.generalSettings.effectSettings");

let errorCheck;

let lightsOnCounter = 0;
let lightsOffCounter = 0;
let flagSwitchCounter = 0;
let simulatedFlagCounter = 0;
let timesF1MVApiCalled = 0;
let timesCheckAPIS = 0;
let developerModeWasActivated = false;
const fetch = require("node-fetch").default;

let staticColor = userConfig.get("Settings.generalSettings.colorSettings.staticColor");
let greenColor = userConfig.get("Settings.generalSettings.colorSettings.green");
let yellowColor = userConfig.get("Settings.generalSettings.colorSettings.yellow");
let redColor = userConfig.get("Settings.generalSettings.colorSettings.red");
let safetyCarColor = userConfig.get("Settings.generalSettings.colorSettings.safetyCar");
let vscColor = userConfig.get("Settings.generalSettings.colorSettings.vsc");
let vscEndingColor = userConfig.get("Settings.generalSettings.colorSettings.vscEnding");

let autoOff = userConfig.get("Settings.generalSettings.autoTurnOffLights");
let goBackToStaticPref = userConfig.get("Settings.generalSettings.goBackToStatic");
let goBackToStaticEnabledFlags = userConfig.get("Settings.generalSettings.goBackToStaticEnabledFlags");
let goBackToStaticDelay = userConfig.get("Settings.generalSettings.goBackToStaticDelay");
goBackToStaticDelay = goBackToStaticDelay * 1000;
let goBackToStaticBrightness = userConfig.get("Settings.generalSettings.staticBrightness");
let goBackToStaticRuns = false;
let goBackToStaticTimeout;


let nanoLeafDevices = userConfig.get("Settings.nanoLeafSettings.devices");
let ikeaDevices = userConfig.get("Settings.ikeaSettings.deviceIDs");
let yeelightIPs = userConfig.get("Settings.yeeLightSettings.deviceIPs");
let hueSelectedDeviceIDs = userConfig.get("Settings.hueSettings.deviceIDs");
let hueSelectedEntertainmentZonesIDs = userConfig.get("Settings.hueSettings.entertainmentZoneIDs");
let hue3rdPartyCompatMode = userConfig.get("Settings.hueSettings.hue3rdPartyCompatMode");

let hueBridgeIP = userConfig.get("Settings.hueSettings.hueBridgeIP");
let hueEnableFade = userConfig.get("Settings.hueSettings.enableFade");
let hueEnableFadeWithEffects = userConfig.get("Settings.hueSettings.enableFadeWithEffects");

let openRGBPort = userConfig.get("Settings.openRGBSettings.openRGBServerPort");
let openRGBIP = userConfig.get("Settings.openRGBSettings.openRGBServerIP");

let homeAssistantDisabled = userConfig.get("Settings.homeAssistantSettings.homeAssistantDisable");
let homeAssistantIP = userConfig.get("Settings.homeAssistantSettings.host");
let homeAssistantPort = userConfig.get("Settings.homeAssistantSettings.port");
let homeAssistantToken = userConfig.get("Settings.homeAssistantSettings.token");
let homeAssistantDevices = userConfig.get("Settings.homeAssistantSettings.devices");

const Ikea = require("node-tradfri-client");
let ikeaCreds;
let ikeaGateway;
let allIkeaDevices = [];

let noUpdateFound = false;

let userActiveUniqueID;

const Sentry = require("@sentry/electron");
Sentry.init({
	dsn: "https://e64c3ec745124566b849043192e58711@o4504289317879808.ingest.sentry.io/4504289338392576",
	release: "F1MV-Lights-Integration@" + app.getVersion(),
	tracesSampleRate: 0.2,
});

function createWindow() {
	win = new BrowserWindow({
		width: 820,
		height: 750,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			zoomFactor: 0.8
		},
		resizable: true,
		maximizable: true,
		minimizable: false,
	});
	win.removeMenu();
	// use better scrollbar
	win.webContents.on("did-finish-load", () => {
		win.webContents.insertCSS(`
            ::-webkit-scrollbar {
                width: 10px;
            }
            ::-webkit-scrollbar-track {
                background: #1e1e1e;
            }
            ::-webkit-scrollbar-thumb {
                background: #888;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: #555;
            }
        `).then(r => {
			if(alwaysFalse) {
				console.log(r);
			}
		});
	});

	win.loadFile("src/static/home/index.html").then(r => {
		if (debugPreference) {
			console.log(r);
		}
	});
	getUniqueID().then(r => {
		if (alwaysFalse) {
			console.log(r);
		}
	});
	if (BrowserWindow.getAllWindows().length === 0) {
		setTimeout(function () {
			initIntegrations().then(r => {
				if (alwaysFalse) {
					console.log(r);
				}
			});
		}, 1000);
	} else if(BrowserWindow.getAllWindows().length > 0) {
		initIntegrations().then(r => {
			if (alwaysFalse) {
				console.log(r);
			}
		});
	}
	createDeepLinks();
}


app.whenReady().then(() => {
	createWindow();

	electronLocalShortcut.register(win, "shift+d", () => {
		if (!devMode) {
			devMode = true;
			developerModeWasActivated = true;
			//userConfig.set('Settings.advancedSettings.debugMode', true);
			//debugPreference = true;
			win.webContents.send("dev", true);
			if (userConfig.get("devConfig.autoStartDevTools")) {
				win.webContents.openDevTools();
			}
			win.webContents.send("log", "Developer Mode Activated!");
		} else if (devMode) {
			devMode = false;
			//userConfig.set('Settings.advancedSettings.debugMode', false);
			//debugPreference = false;
			win.webContents.send("dev", false);
			win.webContents.closeDevTools();
			win.webContents.send("log", "Developer Mode Deactivated!");
		}
	});

	if (testBuild){
		electronLocalShortcut.register(win, "shift+t", () => {
			if (!testMode){
				testMode = true;
				win.webContents.send("test-mode", true);
			} else if (testMode){
				testMode = false;
				win.webContents.send("test-mode", false);
			}
		});

		ipcMain.on("test-button-test-mode", async () => {
			win.webContents.send("log", "There is currently no test action for this button");
		});
	}

	autoUpdater.checkForUpdates().then(r => {
		if (alwaysFalse) {
			console.log(r);
		}
	});


	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

function createDeepLinks(){
	if (process.defaultApp) {
		if (process.argv.length >= 2) {
			app.setAsDefaultProtocolClient("f1mvli", process.execPath, [path.resolve(process.argv[1])]);
		}
	} else {
		app.setAsDefaultProtocolClient("f1mvli");
	}
}

async function getUniqueID(){
	const getUniqueIDURL = APIURL + "/f1mvli/analytics/active-users/getUniqueID";
	const response = await fetch(getUniqueIDURL, {
		method: "GET",
		headers: {
			"Content-Type": "application/json"
		},
	});
	const data = await response.json();
	userActiveUniqueID = data.uniqueID;
}

app.on("window-all-closed", async () => {
	await sendAnalytics();
	if(streamDeckOnline){
		theStreamDeck.close();
	}
	if (openRGBOnline){
		client.disconnect();
	}
	if (webServerOnline){
		http.close();
	}
	if (process.platform !== "darwin") {
		app.quit();
	}
});


ipcMain.on("open-config", () => {
	win.webContents.send("log", "Opening config file...");
	userConfig.openInEditor();
});
ipcMain.on("simulate", (event, arg) => {
	simulateFlag(arg).then(r => {
		if (alwaysFalse) {
			console.log(r);
		}
	});

});
ipcMain.on("toggle-devtools", () => {
	win.webContents.toggleDevTools();
});
ipcMain.on("toggle-logs", () => {
	if (hideLogs) {
		hideLogs = false;
		userConfig.set("Settings.generalSettings.hideLogs", false);
		win.webContents.send("hide-logs", false);
		win.webContents.send("log", "Log visibility toggled on.");
	} else if (!hideLogs) {
		hideLogs = true;
		userConfig.set("Settings.generalSettings.hideLogs", true);
		win.webContents.send("hide-logs", true);
		win.webContents.send("log", "Log visibility toggled off.");
	}
});
ipcMain.on("load-prefs", () => {
	// log pref:
	if(hideLogs){
		win.webContents.send("hide-logs", true);
	} else if (!hideLogs){
		win.webContents.send("hide-logs", false);
	}
	if (f1mvCheck){
		win.webContents.send("f1mv-check-html", true);
	} else if (!f1mvCheck){
		win.webContents.send("f1mv-check-html", false);
	}
});
ipcMain.on("toggle-debug", () => {
	if (debugPreference) {
		debugPreference = false;
		userConfig.set("Settings.advancedSettings.debugMode", false);
		win.webContents.send("log", "Debug Mode Deactivated!");
	} else if (!debugPreference) {
		debugPreference = true;
		userConfig.set("Settings.advancedSettings.debugMode", true);
		win.webContents.send("log", "Debug Mode Activated!");
	}
});
ipcMain.on("updatecheck", () => {
	noUpdateFound = false;
	autoUpdater.checkForUpdates().then(r => {
		if (alwaysFalse) {
			console.log(r);
		}
	});
	win.webContents.send("log", "Checking for updates...");
});
ipcMain.on("test-button-dev", async () => {
	win.webContents.send("log", "Running action mapped on test button...");
	// action here
});
ipcMain.on("check-apis", async () => {
	await updateAllAPIs();
});
ipcMain.on("ikea-select-devices", async () => {
	await ikeaControl(0, 255, 0, userBrightness, "getDevices");
});
ipcMain.on("send-analytics-button", async () => {
	win.webContents.send("log", "Running send analytics code...");
	await sendAnalytics();
});
ipcMain.on("f1mv-check", () => {
	if (f1mvCheck) {
		f1mvCheck = false;
		userConfig.set("Settings.MultiViewerForF1Settings.f1mvCheck", false);
		win.webContents.send("log", "Disabled F1MV Sync!");
		win.webContents.send("f1mv-check-html", false);
	} else if (!f1mvCheck) {
		f1mvCheck = true;
		userConfig.set("Settings.MultiViewerForF1Settings.f1mvCheck", true);
		win.webContents.send("log", "Enabled F1MV sync!");
		win.webContents.send("f1mv-check-html", true);
	}
});
ipcMain.on("auto-devtools", () => {
	const autoDevTools = userConfig.get("devConfig.autoStartDevTools");
	if (autoDevTools) {
		userConfig.set("devConfig.autoStartDevTools", false);
		win.webContents.send("log", "Disabled auto start dev tools");
	} else if (!autoDevTools) {
		userConfig.set("devConfig.autoStartDevTools", true);
		win.webContents.send("log", "Enabled auto start dev tools");
	}
});
ipcMain.on("send-config", () => {
	const config = userConfig.store;
	win.webContents.send("settings", config);
});
ipcMain.on("reload-from-config", () => {
	reloadFromConfig();
});
ipcMain.on("reset-colors-to-defaults", () => {
	userConfig.set("Settings.generalSettings.colorSettings", configDefault.Settings.generalSettings.colorSettings);
	reloadFromConfig();
	win.webContents.send("toaster", "Reset colors to the defaults!");

});
ipcMain.on("hide-disabled-integrations", () => {
	const config = userConfig.store;
	win.webContents.send("hide-disabled-integrations", config);
});
ipcMain.on("restart-app", () => {
	app.relaunch();
	app.exit(0);
});
ipcMain.on("link-openrgb", () => {
	openRGBInitialize(true).then(r => {
		if(alwaysFalse){
			console.log(r);
		}
	});
});
ipcMain.on("linkHue", async () => {
	await hueInitialize();
});
ipcMain.on("refreshHueDevices", async () => {
	win.webContents.send("toaster", "Refreshing Hue Devices...");
	await hueControl(0, 255, 0, userBrightness, "refreshDevices");
	await hueControl(0, 255, 0, userBrightness, "refreshEntertainmentZones");
});
ipcMain.on("select-hue-devices", async () => {
	await hueControl(0, 255, 0, userBrightness, "getDevices");
});
ipcMain.on("select-hue-entertainment-zones", async () => {
	await hueControl(0, 255, 0, userBrightness, "getEntertainmentZones");
});
ipcMain.on("home-assistant-select-devices", async () => {
	await homeAssistantControl(0, 255, 0, userBrightness, "getDevices");
});
let canReceive = false;
ipcMain.on("nanoLeaf", async (event, args) => {
	if(args === "openWindow"){
		if (debugPreference) {
			win.webContents.send("toaster", "Opening Nanoleaf Setup Window...");
		}
		await nanoLeafInitialize("openWindow");
	}
	if(args === "device"){
		canReceive = true;
	}
});
ipcMain.on("nanoLeafDevice", async (event, args) => {
	if(canReceive){
		await nanoLeafAuth(args);
		canReceive = false;
	}
});
ipcMain.on("ikeaSelectorSaveSelectedDevices", async (event, args) => {
	userConfig.set("Settings.ikeaSettings.deviceIDs", args);
});
ipcMain.on("hueSelectorSaveSelectedDevices", async (event, args) => {
	userConfig.set("Settings.hueSettings.deviceIDs", args);
});
ipcMain.on("hueSelectorSaveSelectedEntertainmentZones", async (event, args) => {
	userConfig.set("Settings.hueSettings.entertainmentZoneIDs", args);
});
ipcMain.on("homeAssistantSelectorSaveSelectedDevices", async (event, args) => {
	userConfig.set("Settings.homeAssistantSettings.devices", args);
});
ipcMain.on("save-selected-effects", async (event, args) => {
	for (let i = 0; i < args.length; i++) {
		const effectName = args[i].name;
		const effectEnabled = args[i].enabled;
		const effectSettings = userConfig.get("Settings.generalSettings.effectSettings");
		for (let i = 0; i < effectSettings.length; i++) {
			if (effectSettings[i].name === effectName) {
				effectSettings[i].enabled = effectEnabled;
			}
		}
		userConfig.set("Settings.generalSettings.effectSettings", effectSettings);
	}
});
ipcMain.on("saveConfig", (event, arg) => {
	let deviceIPs = arg.deviceIPs;
	let WLEDDevices = arg.WLEDDevices;

	const {
		defaultBrightness,
		autoTurnOffLights,
		goBackToStatic,
		goBackToStaticEnabledFlags,
		goBackToStaticDelay,
		staticBrightness,
		liveTimingURL,
		hueDisable,
		hueFade,
		hueFadeWithEffects,
		hue3rdPartyCompatMode,
		ikeaDisable,
		securityCode,
		goveeDisable,
		openRGBDisable,
		openRGBServerIP,
		openRGBServerPort,
		homeAssistantDisable,
		homeAssistantHost,
		homeAssistantPort,
		homeAssistantToken,
		nanoLeafDisable,
		WLEDDisable,
		yeeLightDisable,
		streamDeckDisable,
		discordRPCSetting,
		webServerPort,
		webServerDisable,
		updateChannel,
		analytics,
		debugMode,
	} = arg;

	try {
		deviceIPs = deviceIPs.split(",");
	} catch (error) {
		deviceIPs = [];
	}
	try {
		WLEDDevices = WLEDDevices.split(",");
	} catch (error) {
		WLEDDevices = [];
	}

	userConfig.set("Settings.generalSettings.defaultBrightness", parseInt(defaultBrightness));
	userConfig.set("Settings.generalSettings.autoTurnOffLights", autoTurnOffLights);
	userConfig.set("Settings.generalSettings.goBackToStatic", goBackToStatic);
	userConfig.set("Settings.generalSettings.goBackToStaticEnabledFlags", goBackToStaticEnabledFlags);
	userConfig.set("Settings.generalSettings.goBackToStaticDelay", parseInt(goBackToStaticDelay));
	userConfig.set("Settings.generalSettings.staticBrightness", parseInt(staticBrightness));
	userConfig.set("Settings.MultiViewerForF1Settings.liveTimingURL", liveTimingURL);
	userConfig.set("Settings.hueSettings.hueDisable", hueDisable);
	userConfig.set("Settings.hueSettings.hue3rdPartyCompatMode", hue3rdPartyCompatMode);
	userConfig.set("Settings.hueSettings.enableFade", hueFade);
	userConfig.set("Settings.hueSettings.enableFadeWithEffects", hueFadeWithEffects);
	userConfig.set("Settings.ikeaSettings.securityCode", securityCode);
	userConfig.set("Settings.ikeaSettings.ikeaDisable", ikeaDisable);
	userConfig.set("Settings.goveeSettings.goveeDisable", goveeDisable);
	userConfig.set("Settings.openRGBSettings.openRGBDisable", openRGBDisable);
	userConfig.set("Settings.openRGBSettings.openRGBServerIP", openRGBServerIP);
	userConfig.set("Settings.openRGBSettings.openRGBServerPort", parseInt(openRGBServerPort));
	userConfig.set("Settings.homeAssistantSettings.homeAssistantDisable", homeAssistantDisable);
	userConfig.set("Settings.homeAssistantSettings.host", homeAssistantHost);
	userConfig.set("Settings.homeAssistantSettings.port", parseInt(homeAssistantPort));
	userConfig.set("Settings.homeAssistantSettings.token", homeAssistantToken);
	userConfig.set("Settings.nanoLeafSettings.nanoLeafDisable", nanoLeafDisable);
	userConfig.set("Settings.WLEDSettings.WLEDDisable", WLEDDisable);
	userConfig.set("Settings.WLEDSettings.devices", WLEDDevices);
	userConfig.set("Settings.yeeLightSettings.yeeLightDisable", yeeLightDisable);
	userConfig.set("Settings.yeeLightSettings.deviceIPs", deviceIPs);
	userConfig.set("Settings.streamDeckSettings.streamDeckDisable", streamDeckDisable);
	userConfig.set("Settings.discordSettings.discordRPCDisable", discordRPCSetting);
	userConfig.set("Settings.webServerSettings.webServerDisable", webServerDisable);
	userConfig.set("Settings.webServerSettings.webServerPort", parseInt(webServerPort));
	userConfig.set("Settings.advancedSettings.updateChannel", updateChannel);
	userConfig.set("Settings.advancedSettings.analytics", analytics);
	userConfig.set("Settings.advancedSettings.debugMode", debugMode);
});
ipcMain.on("saveConfigColors", (event, arg) => {
	const staticColor = arg.staticColor;
	const green = arg.green;
	const yellow = arg.yellow;
	const red = arg.red;
	const sc = arg.safetyCar;
	const vsc = arg.vsc;
	const vscEnding = arg.vscEnding;


	userConfig.set("Settings.generalSettings.colorSettings.staticColor.r", parseInt(staticColor.r));
	userConfig.set("Settings.generalSettings.colorSettings.staticColor.g", parseInt(staticColor.g));
	userConfig.set("Settings.generalSettings.colorSettings.staticColor.b", parseInt(staticColor.b));
	userConfig.set("Settings.generalSettings.colorSettings.green.r", parseInt(green.r));
	userConfig.set("Settings.generalSettings.colorSettings.green.g", parseInt(green.g));
	userConfig.set("Settings.generalSettings.colorSettings.green.b", parseInt(green.b));
	userConfig.set("Settings.generalSettings.colorSettings.yellow.r", parseInt(yellow.r));
	userConfig.set("Settings.generalSettings.colorSettings.yellow.g", parseInt(yellow.g));
	userConfig.set("Settings.generalSettings.colorSettings.yellow.b", parseInt(yellow.b));
	userConfig.set("Settings.generalSettings.colorSettings.red.r", parseInt(red.r));
	userConfig.set("Settings.generalSettings.colorSettings.red.g", parseInt(red.g));
	userConfig.set("Settings.generalSettings.colorSettings.red.b", parseInt(red.b));
	userConfig.set("Settings.generalSettings.colorSettings.safetyCar.r", parseInt(sc.r));
	userConfig.set("Settings.generalSettings.colorSettings.safetyCar.g", parseInt(sc.g));
	userConfig.set("Settings.generalSettings.colorSettings.safetyCar.b", parseInt(sc.b));
	userConfig.set("Settings.generalSettings.colorSettings.vsc.r", parseInt(vsc.r));
	userConfig.set("Settings.generalSettings.colorSettings.vsc.g", parseInt(vsc.g));
	userConfig.set("Settings.generalSettings.colorSettings.vsc.b", parseInt(vsc.b));
	userConfig.set("Settings.generalSettings.colorSettings.vscEnding.r", parseInt(vscEnding.r));
	userConfig.set("Settings.generalSettings.colorSettings.vscEnding.g", parseInt(vscEnding.g));
	userConfig.set("Settings.generalSettings.colorSettings.vscEnding.b", parseInt(vscEnding.b));
});

async function f1mvAPICall() {
	if (f1mvCheck) {
		try {
			timesF1MVApiCalled++;
			const response = await fetch(f1mvURL, {
				method: "POST",
				headers: {
					"content-type": "application/json"
				},
				body: JSON.stringify({
					"query": "query {\n  liveTimingState {\n    SessionStatus\n SessionInfo\n TrackStatus\n  }\n}"
				})
			});
			if (response.status === 200) {
				const responseData = await response.json();
				SState = responseData.data.liveTimingState.SessionStatus.Status;
				SInfo = responseData.data.liveTimingState.SessionInfo;
				TState = responseData.data.liveTimingState.TrackStatus.Status;
			}
		} catch (e) {
			if (errorCheck !== true) {
				errorCheck = true;
				win.webContents.send("log", "Failed to get the data from the F1MV API: " + e);
			}
		}
	}
}

async function f1mvLightSync() {
	await f1mvAPICall();
	if (TStateCheck !== TState && SState !== "Ends" && SState !== "Finalised") {
		flagSwitchCounter++;
		switch (TState) {
		case "1":
			win.webContents.send("log", "Green flag!");
			await controlAllLights(greenColor.r, greenColor.g, greenColor.b, userBrightness, "on", "green");
			TStateCheck = TState;
			break;
		case "2":
			win.webContents.send("log", "Yellow flag!");
			await controlAllLights(yellowColor.r, yellowColor.g, yellowColor.b, userBrightness, "on", "yellow");
			TStateCheck = TState;
			break;
		case "4":
			win.webContents.send("log", "Safety car!");
			await controlAllLights(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, userBrightness, "on", "safetyCar");
			TStateCheck = TState;
			break;
		case "5":
			win.webContents.send("log", "Red flag!");
			await controlAllLights(redColor.r, redColor.g, redColor.b, userBrightness, "on", "red");
			TStateCheck = TState;
			break;
		case "6":
			win.webContents.send("log", "Virtual safety car!");
			await controlAllLights(vscColor.r, vscColor.g, vscColor.b, userBrightness, "on", "vsc");
			TStateCheck = TState;
			break;
		case "7":
			win.webContents.send("log", "VSC Ending");
			await controlAllLights(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, userBrightness, "on", "vscEnding");
			TStateCheck = TState;
			break;
		}
	} else if (SState === "Ends" || SState === "Finalised") {
		if (SStateCheck !== SState) {
			if (autoOff) {
				win.webContents.send("log", "Session ended, turning off lights...");
				await controlAllLights(0, 0, 0, 0, "off", "sessionEnded");
				SStateCheck = SState;
			}
		}
	}
}

setTimeout(function () {
	setInterval(function () {
		if (BrowserWindow.getAllWindows().length > 0) {
			if (f1mvCheck) {
				f1mvLightSync().then(r => {
					if (alwaysFalse) {
						console.log(r);
					}
				});
			}
		}
	}, 300);
}, 1000);


async function effectHandler(flag){
	for (let i = 0; i < effectSettings.length; i++) {
		// check if the effect is enabled
		if (effectSettings[i].enabled) {
			// check if the flag matches the effect
			if (effectSettings[i].onFlag === flag) {
				// loop through the amount of times the effect should be run
				for (let j = 0; j < effectSettings[i].amount; j++) {
					// loop through the actions
					for (let k = 0; k < effectSettings[i].actions.length; k++) {
						// check the type of action and run the code
						switch (effectSettings[i].actions[k].type) {
						case "on":
							let flagState;
							let colorR = effectSettings[i].actions[k].color.r;
							let colorG = effectSettings[i].actions[k].color.g;
							let colorB = effectSettings[i].actions[k].color.b;
							switch (true) {
							case colorR === greenColor.r && colorG === greenColor.g && colorB === greenColor.b:
								flagState = "green";
								break;
							case colorR === yellowColor.r && colorG === yellowColor.g && colorB === yellowColor.b:
								flagState = "yellow";
								break;
							case colorR === safetyCarColor.r && colorG === safetyCarColor.g && colorB === safetyCarColor.b:
								flagState = "safetyCar";
								break;
							case colorR === redColor.r && colorG === redColor.g && colorB === redColor.b:
								flagState = "red";
								break;
							case colorR === vscColor.r && colorG === vscColor.g && colorB === vscColor.b:
								flagState = "vsc";
								break;
							case colorR === vscEndingColor.r && colorG === vscEndingColor.g && colorB === vscEndingColor.b:
								flagState = "vscEnding";
								break;
							default:
								flagState = "none";
								break;
							}
							let brightness = effectSettings[i].actions[k].brightness;
							await controlAllLights(colorR, colorG, colorB, brightness, "on", flagState);
							break;
						case "off":
							await controlAllLights(0, 0, 0, 0, "off", "off");
							break;
						case "delay":
							let sleepDelay = effectSettings[i].actions[k].delay;
							await sleep(sleepDelay);
							break;
						}
					}
				}
			}
		}
	}
}


async function controlAllLights(r, g, b, brightness, action, flag) {
	for (let i = 0; i < effectSettings.length; i++) {
		if (effectSettings[i].enabled) {
			if (effectSettings[i].onFlag === flag) {
				const oldHueFadeState = hueEnableFade;
				if (hueEnableFadeWithEffects) {
					hueEnableFade = false;
				}
				await effectHandler(flag);
				hueEnableFade = oldHueFadeState;
				return;
			}
		}
	}
	if (!goveeDisabled) {
		await goveeControl(r, g, b, brightness, action);
	}
	if (!yeelightDisabled) {
		await yeelightControl(r, g, b, brightness, action);
	}
	if (!ikeaDisabled) {
		await ikeaControl(r, g, b, brightness, action, flag);
	}
	if (!hueDisabled) {
		await hueControl(r, g, b, brightness, action);
	}
	if (!nanoLeafDisabled) {
		await nanoLeafControl(r, g, b, brightness, action);
	}
	if (!WLEDDisabled) {
		await WLEDControl(r, g, b, brightness, action);
	}
	if (!openRGBDisabled) {
		await openRGBControl(r, g, b, brightness, action);
	}
	if (!homeAssistantDisabled) {
		await homeAssistantControl(r, g, b, brightness, action);
	}
	if (!streamDeckDisabled) {
		await streamDeckControl(r, g, b, brightness, action);
	}
	if (!webServerDisabled) {
		await webServerControl(r, g, b, brightness, action);
	}
	if (goBackToStaticPref) {
		if (action === "off"){
			clearTimeout(goBackToStaticTimeout);
		}
		if (action === "off" || flag === "static"){
			return;
		}
		if (goBackToStaticRuns){
			clearTimeout(goBackToStaticTimeout);
			goBackToStatic(flag);
		} else {
			goBackToStaticRuns = true;
			goBackToStatic(flag);
		}
	}
}

function goBackToStatic(flag){
	if (goBackToStaticEnabledFlags.includes(flag)){
		goBackToStaticTimeout = setTimeout(function () {
			controlAllLights(staticColor.r, staticColor.g, staticColor.b, goBackToStaticBrightness, "on", "static");
			goBackToStaticRuns = false;
		}, goBackToStaticDelay);
	} else {
		goBackToStaticRuns = false;
	}
}

async function simulateFlag(arg) {
	if (arg === "Green") {
		await controlAllLights(greenColor.r, greenColor.g, greenColor.b, userBrightness, "on", "green");
		simulatedFlagCounter++;
	}
	if (arg === "Red") {
		await controlAllLights(redColor.r, redColor.g, redColor.b, userBrightness, "on", "red");
		simulatedFlagCounter++;
	}
	if (arg === "Yellow") {
		await controlAllLights(yellowColor.r, yellowColor.g, yellowColor.b, userBrightness, "on", "yellow");
		simulatedFlagCounter++;
	}
	if (arg === "SC") {
		await controlAllLights(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, userBrightness, "on", "safetyCar");
		simulatedFlagCounter++;
	}
	if (arg === "VSC") {
		await controlAllLights(vscColor.r, vscColor.g, vscColor.b, userBrightness, "on", "vsc");
		simulatedFlagCounter++;
	}
	if (arg === "vscEnding") {
		await controlAllLights(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, userBrightness, "on", "vscEnding");
		simulatedFlagCounter++;
	}
	if (arg === "alloff") {
		await controlAllLights(0, 0, 0, 0, "off", "alloff");
		simulatedFlagCounter++;
	}
	if (arg === "alloff") {
		win.webContents.send("log", "Turned off all lights!");
	} else if (arg !== "vscEnding") {
		win.webContents.send("log", "Simulated " + arg + "!");
	}
	if (arg === "vscEnding") {
		win.webContents.send("log", "Simulated VSC Ending!");
	}
}


async function sendAllAPIStatus() {
	if (userActiveUniqueID === undefined) {
		await getUniqueID();
	}
	if(!goveeDisabled && goveeInitialized){
		goveeOnline = govee.devicesArray.length > 0;
	} else {
		goveeOnline = false;
	}
	if (!nanoLeafDisabled) {
		// noinspection RedundantIfStatementJS
		if (nanoLeafDevices.length > 0) {
			nanoLeafOnline = true;
		} else {
			nanoLeafOnline = false;
		}
	}
	if (!WLEDDisabled) {
		// noinspection RedundantIfStatementJS
		if (WLEDDeviceIPs.length > 0) {
			WLEDOnline = true;
		} else {
			WLEDOnline = false;
		}
	}
	if (!homeAssistantDisabled) {
		await homeAssistantOnlineCheck();
	}
	const statuses = [
		{ name: "ikea", online: ikeaOnline },
		{ name: "govee", online: goveeOnline },
		{ name: "hue", online: hueOnline },
		{ name: "openRGB", online: openRGBOnline },
		{ name: "homeAssistant", online: homeAssistantOnline},
		{ name: "yeelight", online: !yeelightDisabled },
		{ name: "streamDeck", online: streamDeckOnline },
		{ name: "nanoLeaf", online: nanoLeafOnline},
		{ name: "WLED", online: WLEDOnline},
		{ name: "f1mv", online: f1mvAPIOnline },
		{ name: "f1tv", online: f1LiveSession },
		{ name: "update", online: updateAPIOnline },
		{ name: "webServer", online: webServerOnline}
	];

	for (const status of statuses) {
		if (status.online) {
			win.webContents.send(`${status.name}API`, "online");
		}
	}
}

async function initIntegrations() {
	const integrations = [
		{ name: "ikea", func: ikeaInitialize, disabled: ikeaDisabled },
		{ name: "govee", func: goveeInitialize, disabled: goveeDisabled },
		{ name: "hue", func: hueInitialize, disabled: hueDisabled },
		{ name: "openRGB", func: openRGBInitialize, disabled: openRGBDisabled },
		{ name: "homeAssistant", func: homeAssistantInitialize, disabled: homeAssistantDisabled },
		{ name: "streamDeck", func: streamDeckInitialize, disabled: streamDeckDisabled },
		{ name: "discordRPC", func: discordRPC, disabled: false },
		{ name: "webServer", func: webServerInitialize, disabled: webServerDisabled }
	];

	for (const integration of integrations) {
		if (!integration.disabled) {
			await integration.func();
		}
	}

	setInterval(async () => {
		if (BrowserWindow.getAllWindows().length > 0) {
			await checkMiscAPIS();
		}
	}, 15000);
	await sendAllAPIStatus();
}

async function updateAllAPIs(){
	await checkMiscAPIS();
	await sendAllAPIStatus();
}

setInterval(async () => {
	if (BrowserWindow.getAllWindows().length > 0) {
		await sendAllAPIStatus();
	}
}, 5000);


async function discordRPC(){
	const clientId = "1027664070993772594";
	const DiscordRPC = require("discord-rpc");
	const RPC = new DiscordRPC.Client({ transport: "ipc" });

	DiscordRPC.register(clientId);

	let nowDate = Date.now();

	async function setActivity() {

		if(!SInfo) {
			SInfo = {
				Name: "nothing"
			};
		}

		if (!RPC) return;
		await RPC.setActivity({
			details: `Watching ${SInfo.Name} with MultiViewer`,
			state: "F1MV-Lights-Integration is running",
			startTimestamp: nowDate,
			largeImageKey: "f1mv_logo",
			largeImageText: "Logo of F1MV",
			instance: false,
			buttons: [
				{
					label: "Download MultiViewer for F1!",
					url: "https://multiviewer.app/download",
				},
				{
					label: "Download F1MV Lights Integrat..",
					url: "https://github.com/JustJoostNL/F1MV-Lights-Integration/releases/latest",
				}
			],
		});
	}

	RPC.on("ready", async () => {
		if(!discordRPCDisabled && f1mvAPIOnline) {
			await setActivity();
		}
		setInterval(async () => {
			if(!discordRPCDisabled && f1mvAPIOnline) {
				await setActivity();
			} else{
				await RPC.clearActivity();
			}
		}, 15000);
	});

	try {
		await RPC.login({clientId});
	} catch (e) {
		setTimeout(async () => {
			if (!discordRPCDisabled) {
				win.webContents.send("log", "Failed to start Discord RPC, is Discord running?");
			}
		}, 1000);
	}
}

async function goveeInitialize() {
	try {
		Govee = require("govee-lan-control");
		govee = new Govee.default();
		goveeInitialized = true;
	} catch (e) {
		goveeInitialized = false;
	}
	govee.on("deviceAdded", (device) => {
		if (debugPreference) {
			win.webContents.send("log", "Govee device found: " + device.model);
		}
	});
}

async function goveeControl(r, g, b, brightness, action) {
	if (goveeOnline) {
		govee.devicesArray.forEach(device => {
			if (debugPreference) {
				win.webContents.send("log", "Govee device selected: " + device.model);
			}
			switch (action) {
			case "on":
				lightsOnCounter++;
				if (debugPreference) {
					win.webContents.send("log", "Turning on the Govee light with the following values: " + "R: " + r + " G: " + g + " B: " + b + " Brightness: " + brightness);
				}
				brightness = parseInt(brightness);
				r = parseInt(r);
				g = parseInt(g);
				b = parseInt(b);
				device.actions.setBrightness(brightness);
				device.actions.setColor({
					rgb: [
						r,
						g,
						b
					],
				});
				if (device.state.isOn === 0) {
					device.actions.setOn();
				}
				break;
			case "off":
				lightsOffCounter++;
				if (debugPreference) {
					win.webContents.send("log", "Turning off Govee light " + device.model);
				}
				device.actions.setOff();
				break;
			case "getState":
				if (debugPreference) {
					win.webContents.send("log", "Getting the state of Govee light " + device.model);
				}
				if (device.state.isOn === 1) {
					win.webContents.send("log", "The light is on");
				} else {
					win.webContents.send("log", "The light is off");
				}
				win.webContents.send("log", "The brightness is: " + device.state.brightness);
				win.webContents.send("log", "The color is: " + device.state.color);
				break;
			}
		});
	}
}

async function ikeaInitialize() {
	const result = await Ikea.discoverGateway();
	if (!result) {
		setTimeout(async () => {
			win.webContents.send("log", "No Ikea Tradfri gateways found!");
		}, 1500);
		return;
	} else {
		ikeaGateway = result.addresses[0];
	}
	const tradfriClient = new Tradfri.TradfriClient(ikeaGateway, {
		watchConnection: true,
	});

	if (ikeaIdentity === undefined || ikeaPSK === undefined) {
		let authCheck = false;
		if (debugPreference){
			setTimeout(async () => {
				win.webContents.send("log", "No IKEA Tradfri credentials found, authenticating using security code...");
			}, 1500);
		}
		try {
			const {identity, psk} = await tradfriClient.authenticate(ikeaSecurityCode);
			ikeaCreds = {identity, psk};
			authCheck = true;
		} catch (e) {
			setTimeout(async () => {
				win.webContents.send("log", "Authentication using security code failed! Error: " + e.message);
			}, 1500);
			return;
		}
		if (debugPreference && authCheck) {
			setTimeout(async () => {
				win.webContents.send("log", "Authentication successful!");
			}, 1500);
		}
		userConfig.set("Settings.ikeaSettings.identity", ikeaCreds.identity);
		userConfig.set("Settings.ikeaSettings.psk", ikeaCreds.psk);
	} else {
		if (debugPreference){
			setTimeout(async () => {
				win.webContents.send("log", "IKEA Tradfri credentials found, connecting using credentials...");
			}, 1500);
		}
		ikeaCreds = {identity: ikeaIdentity, psk: ikeaPSK};
	}

	try {
		await tradfriClient.connect(ikeaCreds.identity, ikeaCreds.psk);
		ikeaOnline = true;
	} catch {
		setTimeout(async () => {
			win.webContents.send("log", "Failed to connect to IKEA Tradfri Gateway!");
		}, 1500);
		ikeaOnline = false;
	}
	if(ikeaOnline) {
		if(debugPreference){
			setTimeout(async () => {
				win.webContents.send("log", "Connected to IKEA Tradfri Gateway!");
			}, 1500);
		}
		try {
			await tradfriClient.on("device updated", (d) => {
				allIkeaDevices[d.instanceId] = d;
			}).observeDevices();
		} catch {
			setTimeout(async () => {
				win.webContents.send("log", "Failed to observe IKEA Tradfri devices");
			}, 1500);
		}
		await ikeaCheckSpectrum();
	}
}

async function ikeaCheckSpectrum(){
	colorDevices = [];
	whiteDevices = [];
	for (let i = 0; i < ikeaDevices.length; i++) {
		if (debugPreference) {
			win.webContents.send("log", "Checking if Ikea device is RGB or WHITE");
			win.webContents.send("log", "Device to check: " + ikeaDevices[i]);
		}
		const deviceToCheck = allIkeaDevices[ikeaDevices[i]];
		if (deviceToCheck.lightList[0].spectrum === "rgb"){
			if (debugPreference) {
				win.webContents.send("log", "Device: " + ikeaDevices[i] + " is RGB");
			}
			colorDevices.push(ikeaDevices[i]);
		} else {
			if (debugPreference) {
				win.webContents.send("log", "Device: " + ikeaDevices[i] + " is WHITE");
			}
			whiteDevices.push(ikeaDevices[i]);
		}

	}
}

async function ikeaControl(r, g, b, brightness, action, flag) {
	if (ikeaOnline) {
		switch (action) {
		case "getDevices":
			let deviceInformation = [];
			let allInformation = [];
			for (const deviceId in allIkeaDevices) {
				const device = allIkeaDevices[deviceId];
				if (device.type !== 2) {
					continue;
				}
				deviceInformation.push({
					name: device.name,
					id: device.instanceId,
					state: device.lightList[0].onOff,
					spectrum: device.lightList[0].spectrum,
				});
			}
			const ikeaSelectedDevices = userConfig.get("Settings.ikeaSettings.deviceIDs");
			allInformation = {
				deviceInformation: deviceInformation,
				ikeaSelectedDevices: ikeaSelectedDevices,
			};
			const ikeaDeviceSelectorWin = new BrowserWindow({
				width: 1200,
				height: 600,
				webPreferences: {
					contextIsolation: false,
					nodeIntegration: true
				},
				resizable: false,
				maximizable: false,
				minimizable: true,
			});
			ikeaDeviceSelectorWin.removeMenu();
			ikeaDeviceSelectorWin.webContents.on("did-finish-load", () => {
				ikeaDeviceSelectorWin.webContents.insertCSS(`
            ::-webkit-scrollbar {
                width: 10px;
            }
            ::-webkit-scrollbar-track {
                background: #1e1e1e;
            }
            ::-webkit-scrollbar-thumb {
                background: #888;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: #555;
            }
        `).then(r => {
					if (alwaysFalse) {
						console.log(r);
					}
				});
				ikeaDeviceSelectorWin.webContents.send("ikeaAllInformation", allInformation);
			});
			await ikeaDeviceSelectorWin.loadFile("src/static/ikea/ikea-device-selector.html");
			break;

		case "on":
			lightsOnCounter++;
			let hueValue;
			let saturationValue;
			if (debugPreference) {
				win.webContents.send("log", "Turning on the Ikea lights...");
			}

			// convert rgb to hsl
			const color = new ColorTranslator("rgb(" + r + "," + g + "," + b + ")");
			hueValue = color.H;
			saturationValue = color.S;
			if (debugPreference) {
				win.webContents.send("log", "The converted hue value from the given RGB value for Ikea RGB lights is: " + hueValue);
			}

			colorDevices.forEach(device => {
				if(debugPreference){
					win.webContents.send("log", "Turning on the Ikea RGB light with the ID: " + device);
				}
				device = allIkeaDevices[device].lightList[0];
				device.toggle(true);
				device.setHue(hueValue, 0);
				device.setSaturation(saturationValue, 0);
				device.setBrightness(brightness, 0);
			});
			whiteDevices.forEach(device => {
				if(debugPreference){
					win.webContents.send("log", "Turning on the Ikea White light with the ID: " + device);
				}
				device = parseInt(device);
				device = allIkeaDevices[device].lightList[0];
				switch (flag) {
				case "green":
					device.toggle(true);
					device.setBrightness(brightness, 0);
					device.setColorTemperature(0, 0);
					break;
				case "red":
					device.toggle(true);
					device.setBrightness(brightness, 0);
					device.setColorTemperature(454, 0);
					break;
				case "yellow":
				case "safetyCar":
				case "vsc":
				case "vscEnding":
					device.toggle(true);
					device.setBrightness(brightness, 0);
					device.setColorTemperature(60, 0);
					break;
				}
			});
			break;

		case "off":
			lightsOffCounter++;
			colorDevices.forEach(device => {
				if(debugPreference){
					win.webContents.send("log", "Turning off the Ikea RGB light with the ID: " + device);
				}
				device = parseInt(device);
				device = allIkeaDevices[device].lightList[0];
				device.toggle(false);
			});
			whiteDevices.forEach(device => {
				if(debugPreference){
					win.webContents.send("log", "Turning off the Ikea White light with the ID: " + device);
				}
				device = parseInt(device);
				device = allIkeaDevices[device].lightList[0];
				device.toggle(false);
			});
			break;
		}

	} else if (action === "getDevices"){
		win.webContents.send("toaster", "Ikea is disabled or not connected!");
	}
}

async function yeelightControl(r, g, b, brightness, action) {
	if (!yeelightDisabled) {
		yeelightIPs.forEach((light) => {
			const bulb = new Bulb(light);
			bulb.on("connected", (lamp) => {
				try {
					switch (action){
					case "on":
						if(debugPreference){
							win.webContents.send("log", "Turning on the Yeelight light with the IP: " + light);
						}
						lightsOnCounter++;
						lamp.color(r, g, b);
						lamp.brightness(brightness);
						lamp.onn();
						lamp.disconnect();
						break;
					case "off":
						if(debugPreference){
							win.webContents.send("log", "Turning off the Yeelight light with the IP: " + light);
						}
						lightsOffCounter++;
						lamp.off();
						lamp.disconnect();
						break;
					}
				} catch (err) {
					if (debugPreference) {
						win.webContents.send("log", "Error while performing an action on a YeeLight light: " + err);
					}
				}
			});
			bulb.on("error", (err) => {
				if (debugPreference) {
					win.webContents.send("log", "Error while connecting to a YeeLight light: " + err);
				}
			});
			bulb.connect();
		});
	}
}

const hue = require("node-hue-api");
let hueBridgeFound = false;
let hueApi;
let hueClient;
let hueAllLights;
let hueEntertainmentZones;
let createdUser;
let authHueApi;
let token;
async function hueInitialize() {
	let bridgeIP = userConfig.get("Settings.hueSettings.hueBridgeIP");
	if (bridgeIP === undefined || bridgeIP === null || bridgeIP === "") {
		win.webContents.send("toaster", "No Hue bridge IP found, searching for one...");
		hueApi = await hue.discovery.nupnpSearch();
		if (hueApi.length === 0) {
			win.webContents.send("toaster", "No Hue bridges found");
			hueBridgeFound = false;
		} else {
			bridgeIP = hueApi[0].ipaddress;
			userConfig.set("Settings.hueSettings.hueBridgeIP", bridgeIP);
			win.webContents.send("toaster", "Hue bridge found at: " + bridgeIP);
			hueBridgeFound = true;
		}
	} else {
		bridgeIP = userConfig.get("Settings.hueSettings.hueBridgeIP");
		win.webContents.send("toaster", "Hue bridge found at: " + bridgeIP);
		hueBridgeFound = true;
	}
	if (hueBridgeFound) {
		hueClient = await hue.v3.api.createLocal(bridgeIP).connect();

		const appName = "F1MV-Lights-Integration";
		const deviceName = "DeviceName";

		try {
			if (userConfig.get("Settings.hueSettings.token") === undefined) {
				if (debugPreference) {
					win.webContents.send("toaster", "No token found, creating one...");
				}
				createdUser = await hueClient.users.createUser(appName, deviceName);
				userConfig.set("Settings.hueSettings.token", createdUser.username);
				if (debugPreference) {
					win.webContents.send("toaster", "Token created: " + createdUser.username);
				}
				token = createdUser.username;
			} else {
				if (debugPreference) {
					win.webContents.send("toaster", "Token found: " + userConfig.get("Settings.hueSettings.token"));
				}
				token = userConfig.get("Settings.hueSettings.token");
			}

			authHueApi = await hue.v3.api.createLocal(bridgeIP).connect(token);

			hueOnline = true;

			hueAllLights = await authHueApi.lights.getAll();
			hueEntertainmentZones = await authHueApi.groups.getEntertainment();

			if (hueAllLights !== undefined) {
				if (debugPreference) {
					win.webContents.send("toaster", "Amount of Hue lights found: " + hueAllLights.length);
				}
				hueAllLights.forEach((light) => {
					if (debugPreference) {
						win.webContents.send("log", "Hue light found: " + light.name);
					}
				});
			} else {
				win.webContents.send("toaster", "No Hue lights found or an error occurred");
			}
		} catch (err) {
			hueOnline = false;
			try {
				if (err.getHueErrorType() === 101) {
					win.webContents.send("toaster", "The Link button on the bridge was not pressed. Please press the Link button and try again.");
				} else {
					win.webContents.send("toaster", `Unexpected Error: ${err.message}`);
				}
			} catch (error) {
				hueOnline = false;
				win.webContents.send("toaster", `Unexpected Error: ${err.message}`);
			}
		}
	}
}

async function hueControl(r, g, b, brightness, action) {
	brightness = Math.round((brightness / 100) * 254);
	if (!hueDisabled && hueOnline) {
		const {
			LightState,
			GroupLightState
		} = require("node-hue-api").v3.lightStates;
		switch (action) {
		case "getDevices":
			if (hueAllLights === null || hueAllLights === undefined) {
				win.webContents.send("toaster", "No Hue lights found or an error occurred.");
			} else {
				hueAllLights = await authHueApi.lights.getAll();
				let deviceInformation = [];
				let allInformation = [];
				hueAllLights.forEach((light) => {
					const name = light.name;
					const id = light.id;
					const state = light.state.on;
					deviceInformation.push({
						name: name,
						id: id,
						state: state
					});
				});
				const hueSelectedDevices = userConfig.get("Settings.hueSettings.deviceIDs");
				allInformation = {
					deviceInformation: deviceInformation,
					hueSelectedDevices: hueSelectedDevices,
				};

				const hueDeviceSelectorWin = new BrowserWindow({
					width: 1200,
					height: 600,
					webPreferences: {
						contextIsolation: false,
						nodeIntegration: true
					}
				});
				hueDeviceSelectorWin.removeMenu();

				hueDeviceSelectorWin.webContents.on("did-finish-load", () => {
					hueDeviceSelectorWin.webContents.send("hueAllInformation", allInformation);
				});
				await hueDeviceSelectorWin.loadFile("src/static/hue/hue-device-selector.html");
			}
			break;

		case "getEntertainmentZones":
			if (hueEntertainmentZones === null || hueEntertainmentZones === undefined) {
				win.webContents.send("toaster", "No Hue entertainment zones found or an error occurred.");
			} else {
				hueEntertainmentZones = await authHueApi.groups.getEntertainment();
				let entertainmentZoneInformation = [];
				let allInformation = [];
				hueEntertainmentZones.forEach((zone) => {
					const name = zone.name;
					const id = zone.id;
					entertainmentZoneInformation.push({
						name: name,
						id: id,
					});
				});
				const hueSelectedEntertainmentZones = userConfig.get("Settings.hueSettings.entertainmentZoneIDs");
				allInformation = {
					entertainmentZoneInformation: entertainmentZoneInformation,
					hueSelectedEntertainmentZones: hueSelectedEntertainmentZones,
				};

				const hueEntertainmentZoneSelectorWin = new BrowserWindow({
					width: 1200,
					height: 600,
					webPreferences: {
						contextIsolation: false,
						nodeIntegration: true
					}
				});
				hueEntertainmentZoneSelectorWin.removeMenu();

				hueEntertainmentZoneSelectorWin.webContents.on("did-finish-load", () => {
					hueEntertainmentZoneSelectorWin.webContents.send("hueAllInformation", allInformation);
				});
				await hueEntertainmentZoneSelectorWin.loadFile("src/static/hue/hue-entertainment-zone-selector.html");
			}
			break;

		case "refreshDevices":
			hueAllLights = await authHueApi.lights.getAll();
			win.webContents.send("toaster", "Hue lights refreshed, found " + hueAllLights.length + " lights");
			break;

		case "refreshEntertainmentZones":
			hueEntertainmentZones = await authHueApi.groups.getEntertainment();
			win.webContents.send("toaster", "Hue entertainment zones refreshed, found " + hueEntertainmentZones.length + " zones");
			break;

		case "on":
			let hueValue = 0;
			let saturationValue = 0;

			const color = new ColorTranslator("rgb(" + r + "," + g + "," + b + ")");
			hueValue = color.H;
			saturationValue = color.S;
			hueValue = Math.round(hueValue * (65535 / 360));
			saturationValue = Math.round(saturationValue * (254 / 100));

			if (hue3rdPartyCompatMode) {
				for (const light of hueSelectedDeviceIDs) {
					lightsOnCounter++;
					if (debugPreference) {
						win.webContents.send("log", "Turning on Hue light with ID: " + light);
					}
					const lightState = new LightState()
						.on(true)
						.bri(brightness)
						.hue(hueValue)
						.sat(saturationValue);

					if (!hueEnableFade) {
						lightState.transitionInstant();
					}
					await authHueApi.lights.setLightState(light, lightState);
				}
			} else {
				for (const light of hueSelectedDeviceIDs) {
					lightsOnCounter++;
					if (debugPreference) {
						win.webContents.send("log", "Turning on Hue light with ID: " + light);
					}
					const lightState = new LightState()
						.on(true)
						.bri(brightness)
						.rgb(r, g, b);

					if (!hueEnableFade) {
						lightState.transitionInstant();
					}
					await authHueApi.lights.setLightState(light, lightState);
				}
			}
			for (const zoneID of hueSelectedEntertainmentZonesIDs) {
				lightsOnCounter++;
				if (debugPreference) {
					win.webContents.send("log", "Turning on Hue entertainment zone with ID: " + zoneID);
				}
				const lightState = new GroupLightState()
					.on(true)
					.bri(brightness)
					.hue(hueValue)
					.sat(saturationValue);

				if (!hueEnableFade) {
					lightState.transitionInstant();
				}
				await authHueApi.groups.setGroupState(zoneID, lightState);
			}
			break;

		case "off":
			for (const light of hueSelectedDeviceIDs) {
				lightsOffCounter++;
				if (debugPreference) {
					win.webContents.send("log", "Turning off Hue light with ID: " + light);
				}
				const lightState = new LightState()
					.on(false);

				if (!hueEnableFade) {
					lightState.transitionInstant();
				}
				await authHueApi.lights.setLightState(light, lightState);
			}
			for (const zoneID of hueSelectedEntertainmentZonesIDs) {
				lightsOffCounter++;
				if (debugPreference) {
					win.webContents.send("log", "Turning off Hue entertainment zone with ID: " + zoneID);
				}
				const lightState = new GroupLightState()
					.on(false);

				if (!hueEnableFade) {
					lightState.transitionInstant();
				}
				await authHueApi.groups.setGroupState(zoneID, lightState);
			}
			break;
		}

	} else if (action === "getDevices" || action === "refreshDevices" || action === "getEntertainmentZones" || action === "refreshEntertainmentZones") {
		win.webContents.send("toaster", "Hue is disabled or not connected.");
	}
}

let nanoLeafWin;
async function nanoLeafInitialize(action) {
	if(action === "openWindow"){
		nanoLeafWin = new BrowserWindow({
			width: 650,
			height: 800,
			webPreferences: {
				contextIsolation: false,
				nodeIntegration: true,
				zoomFactor: 0.8
			},
			resizable: true,
			maximizable: false
		});
		nanoLeafWin.removeMenu();
		electronLocalShortcut.register(nanoLeafWin, "ctrl+shift+f7", () => {
			nanoLeafWin.webContents.openDevTools();
		});
		nanoLeafWin.webContents.on("did-finish-load", () => {
			nanoLeafWin.webContents.insertCSS(`
            ::-webkit-scrollbar {
                width: 10px;
            }
            ::-webkit-scrollbar-track {
                background: #1e1e1e;
            }
            ::-webkit-scrollbar-thumb {
                background: #888;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: #555;
            }
        `);
		});

		await nanoLeafWin.loadFile("src/static/nanoleaf/nanoleaf-setup.html");
	}
}
let deviceToken;
let authFailed = false;
let exist = false;
async function nanoLeafAuth(ip) {
	if (ip === ""){
		nanoLeafWin.webContents.send("log", "Please enter an IP address or hostname!");
		return;
	}
	nanoLeafWin.webContents.send("log", "Connecting to the Nanoleaf device, this may take a few seconds...");
	authFailed = false;
	const AuroraAPI = require("nanoleaves");
	const auroraTemp = new AuroraAPI({
		host: ip
	});
	auroraTemp.newToken().then(token => {
		deviceToken = token;
		// check if the ip/hostname is already in the config, if so, update the token, if not, add it
		if (nanoLeafDevices.length > 0) {
			for (const device of nanoLeafDevices) {
				if (device.host === ip) {
					exist = true;
					nanoLeafWin.webContents.send("log", "Device already found, updating token...");
					userConfig.set("Settings.nanoLeafSettings.devices." + nanoLeafDevices.indexOf(device) + ".token", token);
					nanoLeafWin.webContents.send("log", "Token updated!");
					nanoLeafWin.webContents.send("log", "This window will close in 7 seconds, and you will be asked if you want to add another device.");
					setTimeout(() => {
						nanoLeafWin.close();
					}, 7000);
					setTimeout(() => {
						nanoLeafAddOtherDeviceDialog();
					}, 8000);
					break;
				}
			}
		}
		if(!exist) {
			if (userConfig.get("Settings.nanoLeafSettings.devices") === []) {
				userConfig.set("Settings.nanoLeafSettings.devices", [
					{
						host: ip,
						token: deviceToken
					}
				]);
			} else if (userConfig.get("Settings.nanoLeafSettings.devices") !== []) {
				// add new device to the array
				let newDevices = userConfig.get("Settings.nanoLeafSettings.devices");
				newDevices.push({
					host: ip,
					token: deviceToken
				});
				userConfig.set("Settings.nanoLeafSettings.devices", newDevices);
			}
		}
	}).catch(err => {
		// check if the error includes 401
		if (err.message.includes("401")) {
			nanoLeafWin.webContents.send("log", "The authorization failed, did you press and hold the power button? Please read the text above and try again.");
			authFailed = true;
		} else {
			nanoLeafWin.webContents.send("log", "An error occurred while connecting to the Nanoleaf device, please try again.");
		}
	});
	await new Promise(r => setTimeout(r, 2000));
	if(!authFailed && exist === false) {
		let found;
		const nanoLeafDevices = userConfig.get("Settings.nanoLeafSettings.devices");
		for (const device of nanoLeafDevices) {
			if (device.host === ip) {
				found = true;
				deviceToken = device.token;
				break;
			}
		}
		if (!found) {
			nanoLeafWin.webContents.send("log", "Error: Could not connect to the Nanoleaf device, please try again.");
			return;
		}
		if (found) {
			// create a new aurora object with the token and host
			const aurora = new AuroraAPI({
				host: ip,
				token: deviceToken
			});
			try {
				aurora.identify().then(() => {
					nanoLeafWin.webContents.send("log", "Successfully connected to the Nanoleaf device!");
					nanoLeafWin.webContents.send("log", "If you saw the Nanoleaf device blink, the connection is successful, and you can close this window!");
					nanoLeafWin.webContents.send("log", "If you didn't see the Nanoleaf device blink, please try again!");
				});
				const dialogOptions = {
					type: "info",
					buttons: ["The Connection Was Successful!", "I Want To Try Again!"],
					title: "Connection Review!",
					message: "If you saw the Nanoleaf device blink, the connection is successful, and you can close this window!\nIf you didn't saw the Nanoleaf device blink, please try again!",
					defaultId: 0
				};
				dialog.showMessageBox(nanoLeafWin, dialogOptions).then(result => {
					if (result.response === 0) {
						nanoLeafWin.close();
						const config = userConfig.store;
						win.webContents.send("settings", config);
						setTimeout(() => {
							nanoLeafAddOtherDeviceDialog();
						}, 500);
					} else{
						nanoLeafWin.close();
						nanoLeafInitialize("openWindow");
						// remove the device just added from the config
						let newDevices = userConfig.get("Settings.nanoLeafSettings.devices");
						newDevices.pop();
						userConfig.set("Settings.nanoLeafSettings.devices", newDevices);
						setTimeout(() => {
							nanoLeafWin.webContents.send("log", "You can now try again!");
						}, 1000);
					}
				});
			} catch (error) {
				if (error.message.includes("401")) {
					nanoLeafWin.webContents.send("log", "Error: The token is invalid, please try again.");
				} else {
					nanoLeafWin.webContents.send("log", "Error: Could not connect to the Nanoleaf device, please try again.");
				}
			}
		}
	}
}

async function nanoLeafControl(r, g, b, brightness, action){
	if (nanoLeafOnline) {
		let hueValue;
		let saturationValue;
		const color = new ColorTranslator("rgb(" + r + "," + g + "," + b + ")");
		hueValue = color.H;
		saturationValue = color.S;
		switch (action) {
		case "on":
			lightsOnCounter++;
			if (debugPreference) {
				win.webContents.send("log", "Turning all the available Nanoleaf devices on...");
			}
			if (debugPreference) {
				win.webContents.send("log", "Converted the given RGB for Nanoleaf to a hue value, new value is: " + hueValue);
				win.webContents.send("log", "Converted the given RGB for Nanoleaf to a saturation value, new value is: " + saturationValue);
			}
			for (const device of nanoLeafDevices) {
				if (debugPreference) {
					win.webContents.send("log", "Turning on Nanoleaf device with host: " + device.host + " and token: " + device.token);
				}
				const AuroraAPI = require("nanoleaves");
				const aurora = new AuroraAPI({
					host: device.host,
					token: device.token
				});
				aurora.on();
				aurora.setHue(hueValue);
				aurora.setSaturation(saturationValue);
				aurora.setBrightness(brightness);
			}
			break;
		case "off":
			lightsOffCounter++;
			if (debugPreference) {
				win.webContents.send("log", "Turning all the available Nanoleaf devices off...");
			}
			for (const device of nanoLeafDevices) {
				if (debugPreference) {
					win.webContents.send("log", "Turning off Nanoleaf device with host: " + device.host + " and token: " + device.token);
				}
				const AuroraAPI = require("nanoleaves");
				const aurora = new AuroraAPI({
					host: device.host,
					token: device.token
				});
				aurora.off();
			}
			break;
		}
	}

}
function nanoLeafAddOtherDeviceDialog(){
	if(debugPreference){
		win.webContents.send("log", "Opening the add other device dialog...");
	}
	const dialogOptions = {
		type: "info",
		buttons: ["Yes", "No"],
		title: "Add another device?",
		message: "Do you want to add another device?",
		defaultId: 0
	};
	dialog.showMessageBox(nanoLeafWin, dialogOptions).then(result => {
		if (result.response === 0) {
			nanoLeafInitialize("openWindow").then(r => {
				if(alwaysFalse){
					console.log(r);
				}
			});
		}
	});
}

const { Client } = require("openrgb-sdk");
let client;
async function openRGBInitialize(toast){
	try {
		if(openRGBOnline){
			if(debugPreference){
				win.webContents.send("log", "Already connected to OpenRGB, closing current connection...");
			}
			if(toast){
				win.webContents.send("toaster", "Reconnecting to OpenRGB...");
			}
			client.disconnect();
		} else {
			if(toast){
				win.webContents.send("toaster", "Connecting to OpenRGB...");
			}
		}
		client = new Client("F1MV-Lights-Integration", openRGBPort, openRGBIP);
		await client.connect();
		if(debugPreference){
			win.webContents.send("log", "Connected to OpenRGB!");
		}
		if(toast){
			win.webContents.send("toaster", "Connected to OpenRGB!");
		}
		openRGBOnline = true;
	} catch (error) {
		openRGBOnline = false;
		setTimeout(() => {
			win.webContents.send("log", "Error: Could not connect to OpenRGB, please make sure that OpenRGB is running and that the IP + Port are correct!");
			if(toast){
				win.webContents.send("toaster", "Could not connect to OpenRGB!");
			}
		}, 1500);
	}
}
async function openRGBControl(r, g, b, brightness, action){
	if(openRGBOnline) {
		if (debugPreference) {
			win.webContents.send("log", "Getting all the available OpenRGB devices...");
		}
		const deviceCount = await client.getControllerCount();
		if (debugPreference) {
			win.webContents.send("log", "Found " + deviceCount + " OpenRGB devices!");
		}
		switch (action) {
		case "on":
			lightsOnCounter++;
			if (debugPreference) {
				win.webContents.send("log", "Turning all the available OpenRGB devices on...");
			}
			for (let i = 0; i < deviceCount; i++) {
				let device = await client.getControllerData(i);
				//await client.updateMode(i, 0)

				if (debugPreference) {
					win.webContents.send("log", "Turning on OpenRGB device with name: " + device.name + " and values: " + r + ", " + g + ", " + b + ", " + brightness);
				}

				const colors = Array(device.colors.length).fill({
					red: r,
					green: g,
					blue: b
				});
				await client.updateLeds(i, colors);
				if (debugPreference) {
					win.webContents.send("log", "Successfully updated the colors of the OpenRGB device with name: " + device.name);
				}
			}
			break;
		case "off":
			lightsOffCounter++;
			if (debugPreference) {
				win.webContents.send("log", "Turning all the available OpenRGB devices off...");
			}
			for (let i = 0; i < deviceCount; i++) {
				let device = await client.getControllerData(i);
				await client.updateMode(i, 0);

				if (debugPreference) {
					win.webContents.send("log", "Turning off OpenRGB device with name: " + device.name);
				}

				const colors = Array(device.colors.length).fill({
					red: 0,
					green: 0,
					blue: 0
				});
				await client.updateLeds(i, colors);
				if (debugPreference) {
					win.webContents.send("log", "Successfully updated the colors of the OpenRGB device with name: " + device.name);
				}
			}


		}
	} else if(debugPreference){
		win.webContents.send("log", "There is no active connection to OpenRGB, please make sure that OpenRGB is running and that the IP + Port are correct!");
	}
}

let theStreamDeck;
let streamDeckKeyCount;
async function streamDeckInitialize(){
	try {
		const { openStreamDeck }  = require("@elgato-stream-deck/node");
		theStreamDeck = await openStreamDeck();
		theStreamDeck.clearPanel();
		streamDeckOnline = true;
	} catch (error) {
		setTimeout(() => {
			win.webContents.send("log", "Error: Could not connect to Stream Deck, please make sure that the Stream Deck is connected and that the software is installed!");
		}, 1500);
		streamDeckOnline = false;
	}
	if(streamDeckOnline){
		if(debugPreference){
			setTimeout(() => {
				win.webContents.send("log", "Connected to Stream Deck!");
			}, 1500);
		}
		streamDeckKeyCount = theStreamDeck.NUM_KEYS;
		if(debugPreference){
			setTimeout(() => {
				win.webContents.send("log", "Found " + streamDeckKeyCount + " keys on the Stream Deck!");
			}, 1500);
		}
	}
}

async function streamDeckControl(r, g, b, brightness, action){
	if(streamDeckOnline){
		switch (action){
		case "on":
			lightsOnCounter++;
			if(debugPreference){
				win.webContents.send("log", "Turning all the available Stream Deck keys on...");
			}
			for (let i = 0; i < streamDeckKeyCount; i++) {
				theStreamDeck.setBrightness(brightness);
				theStreamDeck.fillKeyColor(i, r, g, b);
			}
			break;
		case "off":
			lightsOffCounter++;
			if(debugPreference){
				win.webContents.send("log", "Turning all the available Stream Deck keys off...");
			}
			for (let i = 0; i < streamDeckKeyCount; i++) {
				theStreamDeck.fillKeyColor(i, 0, 0, 0);
			}
			break;
		}
	} else if(debugPreference){
		win.webContents.send("log", "There is no active connection to Stream Deck, please make sure that the Stream Deck is connected and that the software is installed!");
	}
}

const express = require("express");
const webApp = express();
const http = require("http").createServer(webApp);
const io = require("socket.io")(http);
async function webServerInitialize() {
	webApp.get("/", (req, res) => {
		res.send(`
      <html lang="en">
        <body style="background-color: black;">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.6.1/socket.io.js"></script>
          <script>
            const socket = io();
            socket.on('color-change', data => {
              document.body.style.backgroundColor = \`rgb(\${data.r}, \${data.g}, \${data.b})\`;
            });
          </script>
        </body>
      </html>
    `);
	});
	try {
		http.listen(webServerPort, () => {
			win.webContents.send("log", "Web server listening on http://localhost:" + webServerPort + "/");
			webServerOnline = true;
		});
	} catch (error) {
		webServerOnline = false;
		win.webContents.send("log", "Could not start the web server, please make sure that the port is not in use! Error: " + error.message);
	}
}

async function webServerControl(r, g, b, brightness, action) {
	io.emit("color-change", {
		r,
		g,
		b,
		brightness,
		action
	});
}


async function WLEDControl(r, g, b, brightness, action){
	brightness = Math.round((brightness / 100) * 254);
	const { WLEDClient } = require("wled-client");
	for (const device of WLEDDeviceIPs) {
		const WLEDDevice = new WLEDClient(device);
		await WLEDDevice.init().catch((error) => {
			win.webContents.send("log", "Error: Could not connect to the WLED device with IP: " + device + " Error: " + error.message);
		});
		switch (action){
		case "on":
			lightsOnCounter++;
			if(debugPreference){
				win.webContents.send("log", "Turning on the WLED device with IP: " + device);
			}
			await WLEDDevice.clearSegments();
			await WLEDDevice.updateState({
				on: true,
				brightness: brightness,
				mainSegmentId: 0,
				segments: [
					{
						effectId: 0,
						colors: [[r,g,b]],
						start: 0,
						stop: WLEDDevice.info.leds.count
					}
				]
			});
			break;

		case "off":
			lightsOffCounter++;
			if(debugPreference){
				win.webContents.send("log", "Turning off the WLED device with IP: " + device);
			}
			await WLEDDevice.updateState({
				on: false,
				brightness: brightness,
			});
			break;
		}
		WLEDDevice.disconnect();
	}
}

async function homeAssistantOnlineCheck(){
	const headers  = {
		"Content-Type": "application/json",
		"Authorization": "Bearer " + homeAssistantToken,
		"Accept": "application/json"
	};
	const url = "http://" + homeAssistantIP + ":" + homeAssistantPort + "/api/";
	const options = {
		method: "GET",
		headers: headers,
	};
	const res = await fetch(url, options);
	const data = await res.json();
	if(data.message === "API running."){
		homeAssistantOnline = true;
		return "online";
	} else {
		homeAssistantOnline = false;
		return "offline";
	}
}

async function homeAssistantInitialize() {
	if(debugPreference){
		win.webContents.send("log", "Checking if the Home Assistant API is online...");
	}
	const status = await homeAssistantOnlineCheck();
	if(status === "online"){
		if(debugPreference){
			win.webContents.send("log", "Home Assistant API is online!");
		}
	} else {
		win.webContents.send("log", "Error: Could not connect to the Home Assistant API, please make sure that the IP and Port are correct!");
	}
}

async function homeAssistantControl(r, g, b, brightness, action){
	if (homeAssistantOnline) {
		brightness = Math.round((brightness / 100) * 254);
		switch (action) {
		case "getDevices":
			const headers = {
				"Authorization": "Bearer " + homeAssistantToken,
				"content-type": "application/json",
			};
			const host = "http://" + homeAssistantIP + ":" + homeAssistantPort;
			const url = host + "/api/states";
			const response = await fetch(url, {
				method: "GET",
				headers: headers,
			});
			const data = await response.json();
			let deviceInformation = [];
			let allInformation = [];
			for (const item of data) {
				if (item.entity_id.startsWith("light.")) {
					const name = item.attributes.friendly_name;
					const id = item.entity_id;
					const state = item.state;
					deviceInformation.push({
						name: name,
						id: id,
						state: state
					});
				}
			}
			const homeAssistantSelectedDevices = userConfig.get("Settings.homeAssistantSettings.devices");
			allInformation = {
				deviceInformation: deviceInformation,
				homeAssistantSelectedDevices: homeAssistantSelectedDevices
			};
			const homeAssistantDeviceSelectorWin = new BrowserWindow({
				width: 1200,
				height: 600,
				webPreferences: {
					contextIsolation: false,
					nodeIntegration: true,
				},
			});
			homeAssistantDeviceSelectorWin.removeMenu();

			homeAssistantDeviceSelectorWin.webContents.on("did-finish-load", () => {
				homeAssistantDeviceSelectorWin.webContents.send("homeAssistantAllInformation", allInformation);
			});
			await homeAssistantDeviceSelectorWin.loadFile("src/static/homeassistant/homeassistant-device-selector.html");
			break;
		case "on":
			// for each device in the array of devices, turn on the light, with the given color and brightness
			const reqURLOn = "http://" + homeAssistantIP + ":" + homeAssistantPort + "/api/services/light/turn_on";
			for (const device in homeAssistantDevices) {
				const headers =  {
					"Authorization": "Bearer " + homeAssistantToken,
					"content-type": "application/json",
				};
				const postData = {
					"entity_id": homeAssistantDevices[device],
					"rgb_color": [r, g, b],
					"brightness": brightness
				};
				const options = {
					method: "POST",
					headers: headers,
					body: JSON.stringify(postData)
				};
				await fetch(reqURLOn, options);
			}
			break;
		case "off":
			const reqURLOff = "http://" + homeAssistantIP + ":" + homeAssistantPort + "/api/services/light/turn_off";
			for (const device in homeAssistantDevices) {
				const headers =  {
					"Authorization": "Bearer " + homeAssistantToken,
					"content-type": "application/json",
				};
				const postData = {
					"entity_id": homeAssistantDevices[device]
				};
				const options = {
					method: "POST",
					headers: headers,
					body: JSON.stringify(postData)
				};
				await fetch(reqURLOff, options);
			}
			break;
		}
	}
}


async function checkMiscAPIS() {
	if(debugPreference){
		win.webContents.send("log", "Checking the Update and F1 Live Session API..");
	}
	timesCheckAPIS++;
	fetch(updateURL)
		.then(function () {
			updateAPIOnline = true;
		})
		.catch(function () {
			updateAPIOnline = false;
		});

	try {
		const response = await fetch(f1mvCheckURL);
		const data = await response.json();
		f1mvAPIOnline = data.error !== "No data found, do you have live timing running?";
	} catch (error) {
		if(errorCheck === false){
			win.webContents.send("log", "Error: Could not connect to the F1MV API, please make sure that you have F1MV open, and the Live Timing is running!");
		}
		f1mvAPIOnline = false;
		errorCheck = true;
	}

	const userActiveURL = APIURL + "/f1mvli/analytics/active-users/post";
	const body = {
		uniqueID: userActiveUniqueID,
		userActive: true
	};
	await fetch(userActiveURL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(body)
	});


	const liveSessionCheckURL = APIURL + "/f1tv/live-session";
	const liveSessionRes = await fetch(liveSessionCheckURL);
	const liveSessionData = await liveSessionRes.json();
	f1LiveSession = liveSessionData.liveSessionFound === true;
}

async function sendAnalytics() {
	let analyticsIDReturned;
	let analyticsSuccess = false;
	let userActiveSuccess = false;
	const userActiveBody = {
		uniqueID: userActiveUniqueID,
		userActive: false
	};
	const userActiveURL = APIURL + "/f1mvli/analytics/active-users/post";
	const userActiveRes = await fetch(userActiveURL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(userActiveBody)
	});
	if (userActiveRes.status === 200) {
		userActiveSuccess = true;
	}
	if (analyticsPreference && !analyticsSent) {
		if(debugPreference){
			console.log("Sending analytics...");
		}
		const currentTime = new Date().toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false
		});
		const currentDate = new Date();
		const day = currentDate.getDate();
		const month = currentDate.getMonth() + 1;
		const year = currentDate.getFullYear();
		const date = day + "-" + month + "-" + year;

		const config = userConfig.store;

		//remove personal data from config
		delete config.Settings.ikeaSettings.securityCode;
		delete config.Settings.ikeaSettings.psk;
		delete config.Settings.hueSettings.token;
		for (const device of config.Settings.nanoLeafSettings.devices) {
			delete device.token;
		}

		const data = {
			"time_of_sending": currentTime,
			"date_of_sending": date,
			"config": config,
			"light_on_counter": lightsOnCounter,
			"light_off_counter": lightsOffCounter,
			"simulated_flag_counter": simulatedFlagCounter,
			"flag_switch_counter": flagSwitchCounter,
			"times_apis_are_checked": timesCheckAPIS,
			"times_f1mv_api_called": timesF1MVApiCalled,
			"dev_mode_was_activated": developerModeWasActivated
		};
		const options = {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(data)
		};
		const analyticsURL = APIURL + "/f1mvli/analytics/post";
		const response = await fetch(analyticsURL, options); {
			const responseData = await response.json();
			if (debugPreference) {
				console.log(responseData);
			}
			if (response.status === 200) {
				analyticsSuccess = true;
				analyticsIDReturned = responseData.uniqueId;
				userConfig.set("latestAnalyticsID", analyticsIDReturned);
			} else {
				analyticsSuccess = false;
				if (debugPreference) {
					console.log("Analytics failed to send with status code: " + response.status + " and error: " + responseData.error);
				}
			}
		}
		if(userActiveSuccess && analyticsSuccess){
			analyticsSent = true;
			console.log("All analytics are successfully sent!");
		}
	} else {
		if(debugPreference){
			console.log("Analytics are disabled or already sent!");
		}
	}
}

function reloadFromConfig(){
	const webServerDisableOld = webServerDisabled;
	const goveeDisableOld = goveeDisabled;
	const ikeaDisableOld = ikeaDisabled;
	const homeAssistantDisableOld = homeAssistantDisabled;

	win.webContents.send("log", "Reloading from config..");
	debugPreference = userConfig.get("Settings.advancedSettings.debugMode");
	f1mvRawURL = userConfig.get("Settings.MultiViewerForF1Settings.liveTimingURL");
	f1mvCheckURL = userConfig.get("Settings.MultiViewerForF1Settings.liveTimingURL");
	ikeaDisabled = userConfig.get("Settings.ikeaSettings.ikeaDisable");
	goveeDisabled = userConfig.get("Settings.goveeSettings.goveeDisable");
	yeelightDisabled = userConfig.get("Settings.yeeLightSettings.yeeLightDisable");
	hueDisabled = userConfig.get("Settings.hueSettings.hueDisable");
	nanoLeafDisabled = userConfig.get("Settings.nanoLeafSettings.nanoLeafDisable");
	openRGBDisabled = userConfig.get("Settings.openRGBSettings.openRGBDisable");
	ikeaSecurityCode = userConfig.get("Settings.ikeaSettings.securityCode");
	analyticsPreference = userConfig.get("Settings.advancedSettings.analytics");
	userBrightness = parseInt(userConfig.get("Settings.generalSettings.defaultBrightness"));
	f1mvCheck = userConfig.get("Settings.MultiViewerForF1Settings.f1mvCheck");
	hideLogs = userConfig.get("Settings.generalSettings.hideLogs");
	staticColor = userConfig.get("Settings.generalSettings.colorSettings.staticColor");
	greenColor = userConfig.get("Settings.generalSettings.colorSettings.green");
	yellowColor = userConfig.get("Settings.generalSettings.colorSettings.yellow");
	redColor = userConfig.get("Settings.generalSettings.colorSettings.red");
	safetyCarColor = userConfig.get("Settings.generalSettings.colorSettings.safetyCar");
	vscColor = userConfig.get("Settings.generalSettings.colorSettings.vsc");
	vscEndingColor = userConfig.get("Settings.generalSettings.colorSettings.vscEnding");
	autoOff = userConfig.get("Settings.generalSettings.autoTurnOffLights");
	nanoLeafDevices = userConfig.get("Settings.nanoLeafSettings.devices");
	ikeaDevices = userConfig.get("Settings.ikeaSettings.deviceIDs");
	yeelightIPs = userConfig.get("Settings.yeeLightSettings.deviceIPs");
	hueSelectedDeviceIDs = userConfig.get("Settings.hueSettings.deviceIDs");
	hueBridgeIP = userConfig.get("Settings.hueSettings.hueBridgeIP");
	hueEnableFade = userConfig.get("Settings.hueSettings.enableFade");
	hueEnableFadeWithEffects = userConfig.get("Settings.hueSettings.enableFadeWithEffects");
	hueSelectedEntertainmentZonesIDs = userConfig.get("Settings.hueSettings.entertainmentZoneIDs");
	hue3rdPartyCompatMode = userConfig.get("Settings.hueSettings.hue3rdPartyCompatMode");
	openRGBPort = userConfig.get("Settings.openRGBSettings.openRGBServerPort");
	openRGBIP = userConfig.get("Settings.openRGBSettings.openRGBServerIP");
	streamDeckDisabled = userConfig.get("Settings.streamDeckSettings.streamDeckDisable");
	discordRPCDisabled = userConfig.get("Settings.discordSettings.discordRPCDisable");
	webServerPort = userConfig.get("Settings.webServerSettings.webServerPort");
	webServerDisabled = userConfig.get("Settings.webServerSettings.webServerDisable");
	WLEDDisabled = userConfig.get("Settings.WLEDSettings.WLEDDisable");
	WLEDDeviceIPs = userConfig.get("Settings.WLEDSettings.devices");
	goBackToStaticPref = userConfig.get("Settings.generalSettings.goBackToStatic");
	goBackToStaticEnabledFlags = userConfig.get("Settings.generalSettings.goBackToStaticEnabledFlags");
	goBackToStaticDelay = userConfig.get("Settings.generalSettings.goBackToStaticDelay");
	goBackToStaticDelay = goBackToStaticDelay * 1000;
	goBackToStaticBrightness = userConfig.get("Settings.generalSettings.staticBrightness");
	effectSettings = userConfig.get("Settings.generalSettings.effectSettings");
	homeAssistantDisabled = userConfig.get("Settings.homeAssistantSettings.homeAssistantDisable");
	homeAssistantIP = userConfig.get("Settings.homeAssistantSettings.host");
	homeAssistantPort = userConfig.get("Settings.homeAssistantSettings.port");
	homeAssistantToken = userConfig.get("Settings.homeAssistantSettings.token");
	homeAssistantDevices = userConfig.get("Settings.homeAssistantSettings.devices");

	updateChannel = userConfig.get("Settings.advancedSettings.updateChannel");
	autoUpdater.channel = updateChannel;

	createF1MVURLs();

	win.webContents.send("log", "Reloaded from config!");
	if (!ikeaDisabled  && ikeaOnline) {
		ikeaCheckSpectrum().then(r => {
			if (alwaysFalse) {
				console.log(r);
			}
		});
	}

	if (webServerDisableOld && !webServerDisabled){
		win.webContents.send("log", "Web server is enabled, starting..");
		webServerInitialize().then(r => {
			if (alwaysFalse) {
				console.log(r);
			}
		});
	} else if(!webServerDisableOld && webServerDisabled){
		win.webContents.send("log", "Web server is disabled, closing..");
		http.close();
	}

	if (goveeDisableOld && !goveeDisabled){
		govee = undefined;
		Govee = undefined;
		goveeInitialize().then(r => {
			if (alwaysFalse) {
				console.log(r);
			}
		});
	}

	if (ikeaDisableOld && !ikeaDisabled) {
		ikeaOnline = false;
		allIkeaDevices = [];
		colorDevices = [];
		whiteDevices = [];
		ikeaInitialize().then(r => {
			if (alwaysFalse) {
				console.log(r);
			}
		});
	}

	if (homeAssistantDisableOld && !homeAssistantDisabled) {
		homeAssistantInitialize().then(r => {
			if (alwaysFalse) {
				console.log(r);
			}
		});
	}
}


let updateFound = false;
autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
	if (process.platform !== "darwin") {
		const dialogOpts = {
			type: "info",
			buttons: ["Restart", "Later"],
			title: "Application Update",
			message: process.platform === "win32" ? releaseNotes : releaseName,
			detail: "A new version has been downloaded. Restart the application to apply the updates.",
		};

		dialog.showMessageBox(dialogOpts).then((returnValue) => {
			if (returnValue.response === 0) autoUpdater.quitAndInstall();
		});
	}
});
autoUpdater.on("update-available", () => {
	updateFound = true;
	if (process.platform !== "darwin") {
		win.webContents.send("log", "There is an update available. Downloading now... You will be notified when the update is ready to install.");
	} else if (process.platform === "darwin") {
		win.webContents.send("log", "There is an update available. Unfortunately, auto-updating is not supported on macOS. Please download the latest version from GitHub.");
	}
});
autoUpdater.on("update-not-available", () => {
	if (!noUpdateFound) {
		win.webContents.send("log", "There are no updates available.");
		noUpdateFound = true;
	}
});

autoUpdater.on("error", (message) => {
	console.error("There was a problem updating the application");
	console.error(message);
});

setInterval(() => {
	if (!updateFound) {
		autoUpdater.checkForUpdates().then(r => {
			if (alwaysFalse) {
				console.log(r);
			}
		});
	}
}, 30000);
