const { ipcRenderer } = require("electron");
const startTime = new Date().getTime();
$(function() {
	const APIs = ["f1mvAPI", "goveeAPI", "streamDeckAPI", "updateAPI", "f1tvAPI", "ikeaAPI", "yeeLightAPI", "hueAPI", "nanoLeafAPI", "WLEDAPI", "openRGBAPI", "homeAssistantAPI", "webServerAPI"];

	APIs.forEach(api => {
		ipcRenderer.on(api, (event, arg) => {
			const statusElement = $(`#${api}`).find(".status");
			if (arg === "online") {
				statusElement.removeClass("error").addClass("success");
			}
			else if (arg === "offline") {
				statusElement.removeClass("success").addClass("error");
			}
		});
	});

});

ipcRenderer.on("log", (event, arg) => {
	if (new Date().getTime() - startTime < 2000) {
		setTimeout(() => {
			$("#log").prepend(`<p style="color: white;">[${new Date().toLocaleTimeString("en-GB", {hour12: false})}] ${arg}</p>`);
		}, 2000 - (new Date().getTime() - startTime));
	} else {
		$("#log").prepend(`<p style="color: white;">[${new Date().toLocaleTimeString("en-GB", {hour12: false})}] ${arg}</p>`);
	}
});
    
ipcRenderer.on("dev", (event, arg) => {
	if (arg === true) {
		$("#dev").show();

	} else if(arg === false) {
		$("#dev").hide();
	}
});

ipcRenderer.on("test-mode", (event, arg) => {
	if (arg === true) {
		$("#test").show();

	} else if(arg === false) {
		$("#test").hide();
	}
});
ipcRenderer.on("f1mv-check-html", (event, arg) => {
	if (arg === true) {
		$("#f1mvSyncToggle").html("<em style=\"color:white\" class=\"material-icons\">toggle_on</em> Toggle F1MV Sync");
	} else if(arg === false) {
		$("#f1mvSyncToggle").html("<em style=\"color:white\" class=\"material-icons\">toggle_off</em> Toggle F1MV Sync");
	}
});

ipcRenderer.on("auto-devtools", (event, arg) => {
	// change the icon from code to code_off
	$("#dev").find("i").removeClass("code").addClass("code_off");
});
ipcRenderer.on("hide-disabled-integrations", (event, arg) => {
	const integrations = ["hue", "yeeLight", "nanoLeaf", "WLED", "openRGB", "homeAssistant", "govee", "ikea", "streamDeck", "webServer"];
	integrations.forEach((integration) => {
		const setting = arg.Settings[integration + "Settings"];
		if (setting[integration + "Disable"]) {
			$("#" + integration + "API").hide();
		} else {
			$("#" + integration + "API").show();
		}
	});
});
ipcRenderer.on("hide-logs", (event, arg) => {
	if (arg === true) {
		$("#logs").hide();

	} else if(arg === false) {
		$("#logs").show();
	}
});

function simulateGreen() {
	M.toast({
		html: "Green flag event sent",
		displayLength: 2000
	});

	ipcRenderer.send("simulate", "Green");
}
ipcRenderer.on("toaster", (event, arg) => {
	M.toast({
		html: arg,
		displayLength: 2000
	});
});

function simulateYellow() {
	M.toast({
		html: "Yellow flag event sent",
		displayLength: 2000
	});

	ipcRenderer.send("simulate", "Yellow");
}

function simulateRed() {
	M.toast({
		html: "Red flag event sent",
		displayLength: 2000
	});

	ipcRenderer.send("simulate", "Red");
}

function simulateSC() {
	M.toast({
		html: "Safety car event sent",
		displayLength: 2000
	});

	ipcRenderer.send("simulate", "SC");
}

function simulateVSC() {
	M.toast({
		html: "VSC event sent",
		displayLength: 2000
	});

	ipcRenderer.send("simulate", "VSC");
}

function simulateVSCEnding() {
	M.toast({
		html: "VSC Ending event sent",
		displayLength: 2000
	});

	ipcRenderer.send("simulate", "vscEnding");
}

function turnAllLightsOff() {
	M.toast({
		html: "Turning all lights off...",
		displayLength: 2000
	});

	ipcRenderer.send("simulate", "alloff");
}

function checkForUpdates() {
	M.toast({
		html: "Checking for updates..",
		displayLength: 2000
	});

	ipcRenderer.send("updatecheck", "updatecheck");
}

function openConfig() {
	M.toast({
		html: "Opening config file...",
		displayLength: 2000
	});
	ipcRenderer.send("open-config");
}

function toggleDevTools() {
	ipcRenderer.send("toggle-devtools");
}

function toggleDebugMode() {
	ipcRenderer.send("toggle-debug");
}

function toggleF1MVApiCheck() {
	ipcRenderer.send("f1mv-check");
}

function toggleAutoDevToolsCheck() {
	ipcRenderer.send("auto-devtools");
}
function testButtonDev() {
	ipcRenderer.send("test-button-dev");
}
function testButtonTestMode() {
	ipcRenderer.send("test-button-test-mode");
}
function hideDisabledIntegrations(){
	ipcRenderer.send("hide-disabled-integrations");
}
function toggleLogs(){
	ipcRenderer.send("toggle-logs");
}
function checkAPIS(){
	ipcRenderer.send("check-apis");
}
function loadPrefs(){
	ipcRenderer.send("load-prefs");
}
window.utils = {
	test: () => {
		console.log("test");
	},
	loadPrefs: () => {
		ipcRenderer.send("load-prefs");
	},
	checkAPIS: () => {
		ipcRenderer.send("check-apis");
	},
};