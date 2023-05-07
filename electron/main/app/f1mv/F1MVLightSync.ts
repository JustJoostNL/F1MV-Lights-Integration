import { F1MVAPICall } from "./F1MVAPICall";
import { statuses } from "../vars/vars";
import { configVars } from "../../config/config";
import controlAllLights from "../light-controller/controlAllLights";
import log from "electron-log";
import { CustomColor } from "../../../types/CustomColorInterface";

async function f1mvLightSync() {

  const greenColor = configVars.greenColor as CustomColor;
  const yellowColor = configVars.yellowColor as CustomColor;
  const safetyCarColor = configVars.safetyCarColor as CustomColor;
  const redColor = configVars.redColor as CustomColor;
  const vscColor = configVars.vscColor as CustomColor;
  const vscEndingColor = configVars.vscEndingColor as CustomColor;

  await F1MVAPICall();
  if (statuses.TStateCheck !== statuses.TState && statuses.SState !== "Ends" && statuses.SState !== "Finalised") {
    switch (statuses.TState) {
      case "1":
        log.info("Green flag!");
        statuses.TStateCheck = statuses.TState;
        await controlAllLights(greenColor.r, greenColor.g, greenColor.b, configVars.defaultBrightness, "on", "green");
        break;
      case "2":
        log.info("Yellow flag!");
        statuses.TStateCheck = statuses.TState;
        await controlAllLights(yellowColor.r, yellowColor.g, yellowColor.b, configVars.defaultBrightness, "on", "yellow");
        break;
      case "4":
        log.info("Safety car!");
        statuses.TStateCheck = statuses.TState;
        await controlAllLights(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, configVars.defaultBrightness, "on", "safetyCar");
        break;
      case "5":
        log.info("Red flag!");
        statuses.TStateCheck = statuses.TState;
        await controlAllLights(redColor.r, redColor.g, redColor.b, configVars.defaultBrightness, "on", "red");
        break;
      case "6":
        log.info("Virtual safety car!");
        statuses.TStateCheck = statuses.TState;
        await controlAllLights(vscColor.r, vscColor.g, vscColor.b, configVars.defaultBrightness, "on", "vsc");
        break;
      case "7":
        log.info("VSC Ending!");
        statuses.TStateCheck = statuses.TState;
        await controlAllLights(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, configVars.defaultBrightness, "on", "vscEnding");
        break;
    }
  } else if (statuses.SState === "Ends" || statuses.SState === "Finalised") {
    if (statuses.SStateCheck !== statuses.SState) {
      if (configVars.autoTurnOffLights) {
        log.info("Session ended, turning off lights...");
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