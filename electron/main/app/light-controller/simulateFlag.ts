import controlAllLights from "./controlAllLights";
import { configVars } from "../../config/config";
import log from "electron-log";
import { CustomColor } from "../../../types/CustomColorInterface";

export default async function simulateFlag(arg) {
  const greenColor = configVars.greenColor as CustomColor;
  const yellowColor = configVars.yellowColor as CustomColor;
  const safetyCarColor = configVars.safetyCarColor as CustomColor;
  const redColor = configVars.redColor as CustomColor;
  const vscColor = configVars.vscColor as CustomColor;
  const vscEndingColor = configVars.vscEndingColor as CustomColor;
  const defaultBrightness = configVars.defaultBrightness as number;


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
    log.info("Turned off all lights!");
  } else if (arg !== "vscEnding") {
    log.info("Simulated " + arg + "!");
  }
  if (arg === "vscEnding") {
    log.info("Simulated VSC Ending!");
  }
}