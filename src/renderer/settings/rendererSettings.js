const { ipcRenderer } = require("electron");


$(function() {
	ipcRenderer.on("settings", (event, arg) => {

		if(arg.Settings.nanoLeafSettings.devices.length === 0){
			$("#nanoleaf-lights").append("<div class=\"check\"<p>No connected Nanoleaf devices found</p></div>").show();
		} else if(arg.Settings.nanoLeafSettings.devices.length > 0){
			arg.Settings.nanoLeafSettings.devices.forEach(function(light) {
				$("#nanoleaf-lights").append(`<div class="check" id="${light.host}"><span class="status success"></span><p>${light.host}</p></div>`);
			});
			$("#nanoleaf-lights").show();
		}


		$("#brightness-input").val(arg.Settings.generalSettings.defaultBrightness);

		if (arg.Settings.generalSettings.autoTurnOffLights) {
			$("#auto-turn-off-setting").attr("checked", "checked");
		}else if (!arg.Settings.generalSettings.autoTurnOffLights) {
			$("#auto-turn-off-setting").removeAttr("checked");
		}

		$("#live-timing-url-input").val(arg.Settings.MultiViewerForF1Settings.liveTimingURL);

		if (arg.Settings.ikeaSettings.ikeaDisable) {
			$("#disable-ikea-setting").attr("checked", "checked");
		}else if (!arg.Settings.ikeaSettings.ikeaDisable) {
			$("#disable-ikea-setting").removeAttr("checked");
		}

		$("#sec-code-input").val(arg.Settings.ikeaSettings.securityCode);
		if (arg.Settings.goveeSettings.goveeDisable) {
			$("#disable-govee-setting").attr("checked", "checked");
		}else if (!arg.Settings.goveeSettings.goveeDisable) {
			$("#disable-govee-setting").removeAttr("checked");
		}

		if (arg.Settings.yeeLightSettings.yeeLightDisable) {
			$("#disable-yeelight-setting").attr("checked", "checked");
		}else if (!arg.Settings.yeeLightSettings.yeeLightDisable) {
			$("#disable-yeelight-setting").removeAttr("checked");
		}

		$("#yeelight-device-ip-input").val(arg.Settings.yeeLightSettings.deviceIPs);
		$("#nanoleaf-device-ip-input").val(arg.Settings.nanoLeafSettings.devices);

		// search in the settings for the dropdown menu with this id: 'update-channel-setting' and set the value to the current update channel
		$("#update-channel-setting").val(arg.Settings.advancedSettings.updateChannel);

		if (arg.Settings.advancedSettings.analytics) {
			$("#analytics-setting").attr("checked", "checked");
		}else if (!arg.Settings.advancedSettings.analytics) {
			$("#analytics-setting").removeAttr("checked");
		}

		if (arg.Settings.advancedSettings.debugMode) {
			$("#debug-mode-setting").attr("checked", "checked");
		}else if (!arg.Settings.advancedSettings.debugMode) {
			$("#debug-mode-setting").removeAttr("checked");
		}

		if (arg.Settings.hueSettings.hueDisable) {
			$("#disable-hue-setting").attr("checked", "checked");
		}else if (!arg.Settings.hueSettings.hueDisable) {
			$("#disable-hue-setting").removeAttr("checked");
		}

		if (arg.Settings.hueSettings.hue3rdPartyCompatMode) {
			$("#hue-compat-mode-setting").attr("checked", "checked");
		}else if (!arg.Settings.hueSettings.hue3rdPartyCompatMode) {
			$("#hue-compat-mode-setting").removeAttr("checked");
		}

		if (arg.Settings.nanoLeafSettings.nanoLeafDisable) {
			$("#disable-nanoleaf-setting").attr("checked", "checked");
		}else if (!arg.Settings.nanoLeafSettings.nanoLeafDisable) {
			$("#disable-nanoleaf-setting").removeAttr("checked");
		}

		if (arg.Settings.WLEDSettings.WLEDDisable) {
			$("#disable-wled-setting").attr("checked", "checked");
		}else if (!arg.Settings.WLEDSettings.WLEDDisable) {
			$("#disable-wled-setting").removeAttr("checked");
		}

		if (arg.Settings.openRGBSettings.openRGBDisable) {
			$("#disable-openrgb-setting").attr("checked", "checked");
		}else if (!arg.Settings.openRGBSettings.openRGBDisable) {
			$("#disable-openrgb-setting").removeAttr("checked");
		}

		if (arg.Settings.streamDeckSettings.streamDeckDisable) {
			$("#disable-stream-deck-setting").attr("checked", "checked");
		}else if (!arg.Settings.streamDeckSettings.streamDeckDisable) {
			$("#disable-stream-deck-setting").removeAttr("checked");
		}

		if (arg.Settings.discordSettings.discordRPCDisable) {
			$("#disable-discord-rpc-setting").attr("checked", "checked");
		}else if (!arg.Settings.discordSettings.discordRPCDisable) {
			$("#disable-discord-rpc-setting").removeAttr("checked");
		}

		if(arg.Settings.generalSettings.goBackToStatic) {
			$("#go-back-to-static-setting").attr("checked", "checked");
		} else if (!arg.Settings.generalSettings.goBackToStatic) {
			$("#go-back-to-static-setting").removeAttr("checked");
		}

		$("#go-back-to-static-delay-input").val(arg.Settings.generalSettings.goBackToStaticDelay);
		$("#go-back-to-static-brightness-input").val(arg.Settings.generalSettings.staticBrightness);

		$("#openrgb-ip-input").val(arg.Settings.openRGBSettings.openRGBServerIP);
		$("#openrgb-port-input").val(arg.Settings.openRGBSettings.openRGBServerPort);

		$("#wled-device-ip-input").val(arg.Settings.WLEDSettings.devices);

		$("#webserver-port-input").val(arg.Settings.webServerSettings.webServerPort);

		if (arg.Settings.webServerSettings.webServerDisable) {
			$("#disable-webserver-setting").attr("checked", "checked");
		}else if (!arg.Settings.webServerSettings.webServerDisable) {
			$("#disable-webserver-setting").removeAttr("checked");
		}
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

	ipcRenderer.send("saveConfig", {
		defaultBrightness: $("#brightness-input").val(),
		autoTurnOffLights: $("#auto-turn-off-setting").is(":checked"),
		goBackToStatic: $("#go-back-to-static-setting").is(":checked"),
		goBackToStaticDelay: $("#go-back-to-static-delay-input").val(),
		staticBrightness: $("#go-back-to-static-brightness-input").val(),
		liveTimingURL: $("#live-timing-url-input").val(),
		hueDisable: $("#disable-hue-setting").is(":checked"),
		hue3rdPartyCompatMode: $("#hue-compat-mode-setting").is(":checked"),
		ikeaDisable: $("#disable-ikea-setting").is(":checked"),
		securityCode: $("#sec-code-input").val(),
		goveeDisable: $("#disable-govee-setting").is(":checked"),
		openRGBDisable: $("#disable-openrgb-setting").is(":checked"),
		openRGBServerIP: $("#openrgb-ip-input").val(),
		openRGBServerPort: $("#openrgb-port-input").val(),
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