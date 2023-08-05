import controlAllLights from "./controlAllLights";
import { configVars } from "../../config/config";
import log from "electron-log";
import { CustomColor } from "../../../types/CustomColorInterface";
import effectHandler from "../effects/effectHandler";

interface IFlagMap {
  [key: string]: string;
}

const flagNameMaps: IFlagMap = {
  green: "Green",
  yellow: "Yellow",
  red: "Red",
  safetyCar: "Safety Car",
  vsc: "Virtual Safety Car",
  vscEnding: "Virtual Safety Car Ending",
  staticColor: "Static Color",
  fastestLap: "Fastest Lap"
};

export default async function simulateFlag(arg) {
  const greenColor = configVars.greenColor as CustomColor;
  const yellowColor = configVars.yellowColor as CustomColor;
  const safetyCarColor = configVars.safetyCarColor as CustomColor;
  const redColor = configVars.redColor as CustomColor;
  const vscColor = configVars.vscColor as CustomColor;
  const vscEndingColor = configVars.vscEndingColor as CustomColor;
  const staticColor = configVars.staticColor as CustomColor;
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
  if (arg === "staticColor") {
    await controlAllLights(staticColor.r, staticColor.g, staticColor.b, defaultBrightness, "on", "staticColor");
  }
  if (arg === "fastestLap") {
    await effectHandler("fastestLap");
  }
  if (arg === "alloff") {
    await controlAllLights(0, 0, 0, 0, "off", "alloff");
  }
  log.info("Simulated " + flagNameMaps[arg] + "!");
}