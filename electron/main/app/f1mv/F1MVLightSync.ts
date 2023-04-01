import {F1MVAPICall} from "./F1MVAPICall";
import {statuses} from "../vars/vars";
import {configVars} from "../../config/config";

async function f1mvLightSync() {
	await F1MVAPICall();
	if (statuses.TStateCheck !== statuses.TState && statuses.SState !== "Ends" && statuses.SState !== "Finalised") {
		switch (statuses.TState) {
		case "1":
			console.log("Green flag!");
			statuses.TStateCheck = statuses.TState;
			break;
		case "2":
			console.log("Yellow flag!");
			statuses.TStateCheck = statuses.TState;
			break;
		case "4":
			console.log("Safety car!");
			statuses.TStateCheck = statuses.TState;
			break;
		case "5":
			console.log("Red flag!");
			statuses.TStateCheck = statuses.TState;
			break;
		case "6":
			console.log("Virtual safety car!");
			statuses.TStateCheck = statuses.TState;
			break;
		case "7":
			console.log("VSC Ending!");
			statuses.TStateCheck = statuses.TState;
			break;
		}
	} else if (statuses.SState === "Ends" || statuses.SState === "Finalised") {
		if (statuses.SStateCheck !== statuses.SState) {
			if (configVars.autoTurnOffLights) {
				console.log("Session ended, turning off lights...");
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