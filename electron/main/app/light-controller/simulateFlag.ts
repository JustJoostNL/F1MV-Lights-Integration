import controlAllLights from "./controlAllLights";
import {configVars} from "../../config/config";

export default async function simulateFlag(arg) {
	const greenColor: any = configVars.greenColor;
	const yellowColor: any = configVars.yellowColor;
	const safetyCarColor: any = configVars.safetyCarColor;
	const redColor: any = configVars.redColor;
	const vscColor: any = configVars.vscColor;
	const vscEndingColor: any = configVars.vscEndingColor;
	const defaultBrightness = configVars.defaultBrightness;


	if (arg === "Green") {
		await controlAllLights(greenColor.r, greenColor.g, greenColor.b, defaultBrightness, "on", "green");
	}
	if (arg === "Red") {
		await controlAllLights(redColor.r, redColor.g, redColor.b, defaultBrightness, "on", "red");
	}
	if (arg === "Yellow") {
		await controlAllLights(yellowColor.r, yellowColor.g, yellowColor.b, defaultBrightness, "on", "yellow");
	}
	if (arg === "SC") {
		await controlAllLights(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, defaultBrightness, "on", "safetyCar");
	}
	if (arg === "VSC") {
		await controlAllLights(vscColor.r, vscColor.g, vscColor.b, defaultBrightness, "on", "vsc");
	}
	if (arg === "vscEnding") {
		await controlAllLights(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, defaultBrightness, "on", "vscEnding");
	}
	if (arg === "alloff") {
		await controlAllLights(0, 0, 0, 0, "off", "alloff");
	}
	if (arg === "alloff") {
		console.log("Turned off all lights!");
	} else if (arg !== "vscEnding") {
		console.log("Simulated " + arg + "!");
	}
	if (arg === "vscEnding") {
		console.log("Simulated VSC Ending!");
	}
}