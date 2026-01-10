import { ColorTranslator } from "colortranslator";
import log from "electron-log";
import { EventType } from "../../../shared/types/config";
import { RGBColor } from "../../../shared/types/integration";

export function rgbToHueSat(r: number, g: number, b: number) {
  const color = new ColorTranslator("rgb(" + r + "," + g + "," + b + ")");
  const hueValue = color.H;
  const satValue = color.S;

  log.debug(
    `Converted RGB(${r}, ${g}, ${b}) to H(${hueValue}) and S(${satValue})`,
  );

  return {
    hue: hueValue,
    sat: satValue,
  };
}

export function rgbToColorTemp(
  event: EventType,
  minMiReds: number,
  maxMiReds: number,
) {
  switch (event) {
    case EventType.GreenFlag:
    case EventType.DrsEnabled:
    case EventType.DrsDisabled:
    case EventType.PitLaneEntryClosed:
    case EventType.PitExitOpen:
    case EventType.PitEntryClosed:
    case EventType.TimePenalty:
      return minMiReds;
    case EventType.RedFlag:
      return maxMiReds;
    case EventType.YellowFlag:
    case EventType.SafetyCar:
    case EventType.VirtualSafetyCar:
    case EventType.VirtualSafetyCarEnding:
    case EventType.ChequeredFlag:
    case EventType.FastestLap:
    case EventType.BlueFlag:
      return (minMiReds + maxMiReds) / 2;
    case EventType.SessionEnded:
      return 0;
    default:
      return 0;
  }
}

export function calculateColorTemperature(
  color: RGBColor,
  minTemp: number,
  maxTemp: number,
): number {
  const warmth = (color.r - color.g - color.b) / 255;
  const warmthNormalized = (warmth + 1) / 2;

  const colorTemp = minTemp + warmthNormalized * (maxTemp - minTemp);

  return Math.round(colorTemp);
}

export function getTradfriColorTempFromEvent(event: EventType) {
  switch (event) {
    case EventType.GreenFlag:
    case EventType.DrsEnabled:
    case EventType.DrsDisabled:
    case EventType.PitLaneEntryClosed:
    case EventType.PitExitOpen:
    case EventType.PitEntryClosed:
    case EventType.BlueFlag:
    case EventType.ChequeredFlag:
    case EventType.TimePenalty:
      return 1;
    case EventType.YellowFlag:
      return 370;
    case EventType.RedFlag:
    case EventType.SafetyCar:
    case EventType.VirtualSafetyCar:
    case EventType.VirtualSafetyCarEnding:
    case EventType.FastestLap:
      return 454;
    default:
      return 1;
  }
}
