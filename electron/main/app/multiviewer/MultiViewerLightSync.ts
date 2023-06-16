import { MultiViewerAPICall } from "./MultiViewerAPICall";
import { statuses } from "../vars/vars";
import { configVars } from "../../config/config";
import controlAllLights from "../light-controller/controlAllLights";
import log from "electron-log";
import { CustomColor } from "../../../types/CustomColorInterface";
import {
  ITimingDataLinesObject,
  ITimingStatsLinesObject
} from "./types";
import effectHandler from "../effects/effectHandler";

let currentFastestLapTime = "";
let currentFastestLapLap = 0;

async function MultiViewerLightSync() {
  const greenColor = configVars.greenColor as CustomColor;
  const yellowColor = configVars.yellowColor as CustomColor;
  const safetyCarColor = configVars.safetyCarColor as CustomColor;
  const redColor = configVars.redColor as CustomColor;
  const vscColor = configVars.vscColor as CustomColor;
  const vscEndingColor = configVars.vscEndingColor as CustomColor;

  await MultiViewerAPICall();
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

async function checkForNewFastestLap(TimingStats: ITimingStatsLinesObject, TimingData: ITimingDataLinesObject){
  if (!TimingData || !TimingStats) return;
  for (const [driver, { Retired, Stopped }] of Object.entries(TimingData)) {
    const { PersonalBestLapTime } = TimingStats[driver];

    if (Retired || Stopped) {
      continue;
    }

    const { Position, Value, Lap } = PersonalBestLapTime;

    if (Position !== 1) {
      continue;
    }
    if (Value === currentFastestLapTime) {
      continue;
    }
    if (Lap <= currentFastestLapLap) {
      continue;
    }

    currentFastestLapTime = Value;
    currentFastestLapLap = Lap;
    await effectHandler("fastestLap");
  }
}

export default async function startMultiViewerSync() {
  setInterval(function () {
    if (configVars.f1mvSync) {
      MultiViewerLightSync();
      checkForNewFastestLap(statuses.TStats, statuses.TData);
    }
  }, 300);
}
