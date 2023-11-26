import { EventType } from "../../../shared/config/config_types";

export function rgbToColorTemp(
  event: EventType,
  minMiReds: number,
  maxMiReds: number,
) {
  switch (event) {
    case EventType.GreenFlag:
    case EventType.GoBackToStatic:
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
  }
}
