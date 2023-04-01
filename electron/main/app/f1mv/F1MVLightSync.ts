import {F1MVAPICall} from "./F1MVAPICall";
import {statuses} from "../vars/vars";
import {configVars} from "../../config/config";
import controlAllLights from "../light-controller/controlAllLights";

async function f1mvLightSync() {

	const greenColor = <any>configVars.greenColor;
	const yellowColor = <any>configVars.yellowColor;
	const safetyCarColor = <any>configVars.safetyCarColor;
	const redColor = <any>configVars.redColor;
	const vscColor = <any>configVars.vscColor;
	const vscEndingColor = <any>configVars.vscEndingColor;

	await F1MVAPICall();
	if (statuses.TStateCheck !== statuses.TState && statuses.SState !== "Ends" && statuses.SState !== "Finalised") {
		switch (statuses.TState) {
		case "1":
			console.log("Green flag!");
			await controlAllLights(greenColor.r, greenColor.g, greenColor.b, configVars.defaultBrightness, "on", "green");
			statuses.TStateCheck = statuses.TState;
			break;
		case "2":
			console.log("Yellow flag!");
			await controlAllLights(yellowColor.r, yellowColor.g, yellowColor.b, configVars.defaultBrightness, "on", "yellow");
			statuses.TStateCheck = statuses.TState;
			break;
		case "4":
			console.log("Safety car!");
			await controlAllLights(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, configVars.defaultBrightness, "on", "safetyCar");
			statuses.TStateCheck = statuses.TState;
			break;
		case "5":
			console.log("Red flag!");
			await controlAllLights(redColor.r, redColor.g, redColor.b, configVars.defaultBrightness, "on", "red");
			statuses.TStateCheck = statuses.TState;
			break;
		case "6":
			console.log("Virtual safety car!");
			await controlAllLights(vscColor.r, vscColor.g, vscColor.b, configVars.defaultBrightness, "on", "vsc");
			statuses.TStateCheck = statuses.TState;
			break;
		case "7":
			console.log("VSC Ending!");
			await controlAllLights(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, configVars.defaultBrightness, "on", "vscEnding");
			statuses.TStateCheck = statuses.TState;
			break;
		}
	} else if (statuses.SState === "Ends" || statuses.SState === "Finalised") {
		if (statuses.SStateCheck !== statuses.SState) {
			if (configVars.autoTurnOffLights) {
				console.log("Session ended, turning off lights...");
				await controlAllLights(0, 0, 0, 0, "off", "off");
				statuses.SStateCheck = statuses.SState;
			}
		}
	}
}

export default async function startF1MVLightSync() {
	setInterval(function () {
		if (configVars.f1mvSync) {
			f1mvLightSync();
		}
	}, 300);
}