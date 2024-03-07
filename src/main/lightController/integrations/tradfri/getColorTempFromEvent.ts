import { EventType } from "../../../../shared/config/config_types";

export function getColorTempFromEvent(event: EventType) {
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
