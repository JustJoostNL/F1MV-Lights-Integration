import {configVars} from "../../config/config";
import {goBackToStatic} from "../vars/vars";
import controlAllLights from "./controlAllLights";

export default async function goBackToStaticColor(flag){
	const goBackToStaticEnabledFlags = <Array<any>>configVars.goBackToStaticEnabledFlags;
	let goBackToStaticDelay = <number>configVars.goBackToStaticDelay;
	goBackToStaticDelay = goBackToStaticDelay * 1000;
	const goBackToStaticBrightness = configVars.staticBrightness;
	const staticColor = <any>configVars.staticColor;


	if (goBackToStaticEnabledFlags.includes(flag)){
		goBackToStatic.goBackToStaticTimeout = setTimeout(async function () {
			await controlAllLights(staticColor.r, staticColor.g, staticColor.b, goBackToStaticBrightness, "on", "static");
			goBackToStatic.goBackToStaticRuns = false;
		}, goBackToStaticDelay);
	} else {
		goBackToStatic.goBackToStaticRuns = false;
	}
}