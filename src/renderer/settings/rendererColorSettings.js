const { ipcRenderer } = require("electron");

$(function() {
	ipcRenderer.on("settings", (event, arg) => {

		console.log("Loading settings...");

		$("#green-flag-red").val(arg.Settings.generalSettings.colorSettings.green.r);
		$("#green-flag-green").val(arg.Settings.generalSettings.colorSettings.green.g);
		$("#green-flag-blue").val(arg.Settings.generalSettings.colorSettings.green.b);
		$("#yellow-flag-red").val(arg.Settings.generalSettings.colorSettings.yellow.r);
		$("#yellow-flag-green").val(arg.Settings.generalSettings.colorSettings.yellow.g);
		$("#yellow-flag-blue").val(arg.Settings.generalSettings.colorSettings.yellow.b);
		$("#red-flag-red").val(arg.Settings.generalSettings.colorSettings.red.r);
		$("#red-flag-green").val(arg.Settings.generalSettings.colorSettings.red.g);
		$("#red-flag-blue").val(arg.Settings.generalSettings.colorSettings.red.b);
		$("#sc-flag-red").val(arg.Settings.generalSettings.colorSettings.safetyCar.r);
		$("#sc-flag-green").val(arg.Settings.generalSettings.colorSettings.safetyCar.g);
		$("#sc-flag-blue").val(arg.Settings.generalSettings.colorSettings.safetyCar.b);
		$("#vsc-flag-red").val(arg.Settings.generalSettings.colorSettings.vsc.r);
		$("#vsc-flag-green").val(arg.Settings.generalSettings.colorSettings.vsc.g);
		$("#vsc-flag-blue").val(arg.Settings.generalSettings.colorSettings.vsc.b);
		$("#vscEnd-flag-red").val(arg.Settings.generalSettings.colorSettings.vscEnding.r);
		$("#vscEnd-flag-green").val(arg.Settings.generalSettings.colorSettings.vscEnding.g);
		$("#vscEnd-flag-blue").val(arg.Settings.generalSettings.colorSettings.vscEnding.b);
	});
});

function saveConfigColors() {
	ipcRenderer.send("saveConfigColors", {
		green: {
			r: $("#green-flag-red").val(),
			g: $("#green-flag-green").val(),
			b: $("#green-flag-blue").val()
		},
		yellow: {
			r: $("#yellow-flag-red").val(),
			g: $("#yellow-flag-green").val(),
			b: $("#yellow-flag-blue").val()
		},
		red: {
			r: $("#red-flag-red").val(),
			g: $("#red-flag-green").val(),
			b: $("#red-flag-blue").val()
		},
		safetyCar: {
			r: $("#sc-flag-red").val(),
			g: $("#sc-flag-green").val(),
			b: $("#sc-flag-blue").val()
		},
		vsc: {
			r: $("#vsc-flag-red").val(),
			g: $("#vsc-flag-green").val(),
			b: $("#vsc-flag-blue").val()
		},
		vscEnding: {
			r: $("#vscEnd-flag-red").val(),
			g: $("#vscEnd-flag-green").val(),
			b: $("#vscEnd-flag-blue").val()
		}
	});
}

function resetColorsToDefaults(){
	ipcRenderer.send("reset-colors-to-defaults");
	sendConfig();
}
function openConfig() {
	M.toast({
		html: "Opening config file...",
		displayLength: 2000
	});
	ipcRenderer.send("open-config");
}
function sendConfig() {
	ipcRenderer.send("send-config");
}
function reloadFromConfig(){
	ipcRenderer.send("reload-from-config");
}