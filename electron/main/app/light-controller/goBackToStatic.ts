import { configVars } from "../../config/config";
import { goBackToStatic } from "../vars/vars";
import controlAllLights from "./controlAllLights";
import {customColor} from "../../../types/CustomColorInterface";

export default async function goBackToStaticColor(flag){
  const goBackToStaticEnabledFlags = configVars.goBackToStaticEnabledFlags as string[];
  let goBackToStaticDelay = configVars.goBackToStaticDelay as number;
  goBackToStaticDelay = goBackToStaticDelay * 1000;
  const goBackToStaticBrightness = configVars.staticBrightness;
  const staticColor = configVars.staticColor as customColor


  if (goBackToStaticEnabledFlags.includes(flag)){
    goBackToStatic.goBackToStaticTimeout = setTimeout(async function () {
      await controlAllLights(staticColor.r, staticColor.g, staticColor.b, goBackToStaticBrightness, "on", "static");
      goBackToStatic.goBackToStaticRuns = false;
    }, goBackToStaticDelay);
  } else {
    goBackToStatic.goBackToStaticRuns = false;
  }
}