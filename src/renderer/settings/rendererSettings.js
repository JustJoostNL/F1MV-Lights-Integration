const { ipcRenderer } = require("electron");


$(function() {
	ipcRenderer.on("settings", (event, arg) => {
		const { Settings } = arg;

		// Display nanoleaf devices
		const nanoleafDevices = Settings.nanoLeafSettings.devices;
		$("#nanoleaf-lights").toggle(nanoleafDevices.length > 0);
		if (nanoleafDevices.length === 0) {
			$("#nanoleaf-lights").append("<div class=\"check\"<p>No connected Nanoleaf devices found</p></div>");
		} else {
			nanoleafDevices.forEach((light) => {
				$("#nanoleaf-lights").append(`<div class="check" id="${light.host}"><span class="status success"></span><p>${light.host}</p></div>`);
			});
		}

		Settings.generalSettings.goBackToStaticEnabledFlags.forEach((flag) => {
			if (flag === "green") {
				$("#go-back-to-static-green-flag-setting").prop("checked", true);
			} else if (flag === "yellow") {
				$("#go-back-to-static-yellow-flag-setting").prop("checked", true);
			} else if (flag === "red") {
				$("#go-back-to-static-red-flag-setting").prop("checked", true);
			} else if (flag === "safetyCar") {
				$("#go-back-to-static-safety-car-setting").prop("checked", true);
			} else if (flag === "vsc") {
				$("#go-back-to-static-vsc-setting").prop("checked", true);
			} else if (flag === "vscEnding") {
				$("#go-back-to-static-vsc-ending-setting").prop("checked", true);
			}
		});

		// Set other settings
		$("#brightness-input").val(Settings.generalSettings.defaultBrightness);
		$("#auto-turn-off-setting").prop("checked", Settings.generalSettings.autoTurnOffLights);
		$("#live-timing-url-input").val(Settings.MultiViewerForF1Settings.liveTimingURL);
		$("#go-back-to-static-delay-input").val(Settings.generalSettings.goBackToStaticDelay);
		$("#go-back-to-static-brightness-input").val(Settings.generalSettings.staticBrightness);
		$("#webserver-port-input").val(Settings.webServerSettings.webServerPort);
		$("#disable-webserver-setting").prop("checked", Settings.webServerSettings.webServerDisable);
		$("#openrgb-ip-input").val(Settings.openRGBSettings.openRGBServerIP);
		$("#openrgb-port-input").val(Settings.openRGBSettings.openRGBServerPort);
		$("#disable-ikea-setting").prop("checked", Settings.ikeaSettings.ikeaDisable);
		$("#sec-code-input").val(Settings.ikeaSettings.securityCode);
		$("#disable-govee-setting").prop("checked", Settings.goveeSettings.goveeDisable);
		$("#disable-yeelight-setting").prop("checked", Settings.yeeLightSettings.yeeLightDisable);
		$("#yeelight-device-ip-input").val(Settings.yeeLightSettings.deviceIPs);
		$("#nanoleaf-device-ip-input").val(nanoleafDevices);
		$("#update-channel-setting").val(Settings.advancedSettings.updateChannel);
		$("#analytics-setting").prop("checked", Settings.advancedSettings.analytics);
		$("#debug-mode-setting").prop("checked", Settings.advancedSettings.debugMode);
		$("#disable-hue-setting").prop("checked", Settings.hueSettings.hueDisable);
		$("#hue-fade-setting").prop("checked", Settings.hueSettings.enableFade);
		$("#hue-fade-with-effects-setting").prop("checked", Settings.hueSettings.enableFadeWithEffects);
		$("#hue-compat-mode-setting").prop("checked", Settings.hueSettings.hue3rdPartyCompatMode);
		$("#disable-nanoleaf-setting").prop("checked", Settings.nanoLeafSettings.nanoLeafDisable);
		$("#disable-wled-setting").prop("checked", Settings.WLEDSettings.WLEDDisable);
		$("#wled-device-ip-input").val(Settings.WLEDSettings.devices);
		$("#disable-openrgb-setting").prop("checked", Settings.openRGBSettings.openRGBDisable);
		$("#disable-home-assistant-setting").prop("checked", Settings.homeAssistantSettings.homeAssistantDisable);
		$("#home-assistant-ip-input").val(Settings.homeAssistantSettings.host);
		$("#home-assistant-port-input").val(Settings.homeAssistantSettings.port);
		$("#home-assistant-token-input").val(Settings.homeAssistantSettings.token);
		$("#disable-stream-deck-setting").prop("checked", Settings.streamDeckSettings.streamDeckDisable);
		$("#disable-discord-rpc-setting").prop("checked", Settings.discordSettings.discordRPCDisable);
		$("#go-back-to-static-setting").prop("checked", Settings.generalSettings.goBackToStatic);
	});


});

function saveConfig() {
	let WLEDDevices;
	if ($("#wled-device-ip-input").val() === "") {
		WLEDDevices = [];
	} else if ($("#wled-device-ip-input").val() !== "") {
		WLEDDevices = $("#wled-device-ip-input").val();
	}

	let deviceIPs;
	if ($("#yeelight-device-ip-input").val() === "") {
		deviceIPs = [];
	} else if ($("#yeelight-device-ip-input").val() !== "") {
		deviceIPs = $("#yeelight-device-ip-input").val();
	}

	let goBackToStaticEnabledFlags = [];
	if ($("#go-back-to-static-green-flag-setting").is(":checked")) {
		goBackToStaticEnabledFlags.push("green");
	}
	if ($("#go-back-to-static-yellow-flag-setting").is(":checked")) {
		goBackToStaticEnabledFlags.push("yellow");
	}
	if ($("#go-back-to-static-red-flag-setting").is(":checked")) {
		goBackToStaticEnabledFlags.push("red");
	}
	if ($("#go-back-to-static-safety-car-setting").is(":checked")) {
		goBackToStaticEnabledFlags.push("safetyCar");
	}
	if ($("#go-back-to-static-vsc-setting").is(":checked")) {
		goBackToStaticEnabledFlags.push("vsc");
	}
	if ($("#go-back-to-static-vsc-ending-setting").is(":checked")) {
		goBackToStaticEnabledFlags.push("vscEnding");
	}

	ipcRenderer.send("saveConfig", {
		defaultBrightness: $("#brightness-input").val(),
		autoTurnOffLights: $("#auto-turn-off-setting").is(":checked"),
		goBackToStatic: $("#go-back-to-static-setting").is(":checked"),
		goBackToStaticEnabledFlags: goBackToStaticEnabledFlags,
		goBackToStaticDelay: $("#go-back-to-static-delay-input").val(),
		staticBrightness: $("#go-back-to-static-brightness-input").val(),
		liveTimingURL: $("#live-timing-url-input").val(),
		hueDisable: $("#disable-hue-setting").is(":checked"),
		hue3rdPartyCompatMode: $("#hue-compat-mode-setting").is(":checked"),
		hueFade: $("#hue-fade-setting").is(":checked"),
		hueFadeWithEffects: $("#hue-fade-with-effects-setting").is(":checked"),
		ikeaDisable: $("#disable-ikea-setting").is(":checked"),
		securityCode: $("#sec-code-input").val(),
		goveeDisable: $("#disable-govee-setting").is(":checked"),
		openRGBDisable: $("#disable-openrgb-setting").is(":checked"),
		openRGBServerIP: $("#openrgb-ip-input").val(),
		openRGBServerPort: $("#openrgb-port-input").val(),
		homeAssistantDisable: $("#disable-home-assistant-setting").is(":checked"),
		homeAssistantHost: $("#home-assistant-ip-input").val(),
		homeAssistantPort: $("#home-assistant-port-input").val(),
		homeAssistantToken: $("#home-assistant-token-input").val(),
		nanoLeafDisable: $("#disable-nanoleaf-setting").is(":checked"),
		WLEDDisable: $("#disable-wled-setting").is(":checked"),
		WLEDDevices: WLEDDevices,
		yeeLightDisable: $("#disable-yeelight-setting").is(":checked"),
		streamDeckDisable: $("#disable-stream-deck-setting").is(":checked"),
		deviceIPs: deviceIPs,
		discordRPCSetting: $("#disable-discord-rpc-setting").is(":checked"),
		webServerPort: $("#webserver-port-input").val(),
		webServerDisable: $("#disable-webserver-setting").is(":checked"),
		updateChannel: $("#update-channel-setting").val(),
		analytics: $("#analytics-setting").is(":checked"),
		debugMode: $("#debug-mode-setting").is(":checked")
	});

}

ipcRenderer.on("toaster", (event, arg) => {
	M.toast({
		html: arg,
		displayLength: 2000
	});
});

function linkHue() {
	ipcRenderer.send("linkHue");
}

function refreshHueDevices(){
	ipcRenderer.send("refreshHueDevices");
}

function nanoLeaf(action) {
	if(action === "device"){
		let ip = $("#nanoleaf-device-ip-input-in-connect-screen").val();
		ipcRenderer.send("nanoLeaf", "device");
		ipcRenderer.send("nanoLeafDevice", ip);
	}
	else if(action === "openWindow"){
		ipcRenderer.send("nanoLeaf", "openWindow");
	}
}
function hueSelectDevices() {
	ipcRenderer.send("select-hue-devices");
}

function hueSelectEntertainmentZones(){
	ipcRenderer.send("select-hue-entertainment-zones");
}

function ikeaSelectDevices() {
	ipcRenderer.send("ikea-select-devices");
}
function homeAssistantSelectDevices() {
	ipcRenderer.send("home-assistant-select-devices");
}
function sendConfig() {
	ipcRenderer.send("send-config");
}
function reloadFromConfig(){
	ipcRenderer.send("reload-from-config");
}
function linkOpenRGB(){
	saveConfig();
	reloadFromConfig();
	ipcRenderer.send("link-openrgb");
}
function openConfig() {
	M.toast({
		html: "Opening config file...",
		displayLength: 2000
	});
	ipcRenderer.send("open-config");
}