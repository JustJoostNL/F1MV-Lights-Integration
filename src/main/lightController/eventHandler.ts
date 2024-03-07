import { ActionType, EventType } from "../../shared/config/config_types";
import { getConfig } from "../ipc/config";
import { sleep } from "../utils/sleep";
import { liveTimingState } from "../multiviewer/api";
import { ControlType, controlAllLights } from "./controlAllLights";

export async function eventHandler(event: EventType) {
  const config = await getConfig();
  const events = config.events;

  for (let i = 0; i < events.length; i++) {
    const currentEvent = events[i];
    if (!currentEvent.triggers.includes(event) || !currentEvent.enabled) {
      continue;
    }

    //repeat for amount
    for (let j = 0; j < currentEvent.amount; j++) {
      //loop through all actions
      for (let k = 0; k < currentEvent.actions.length; k++) {
        const currentAction = currentEvent.actions[k];

        switch (currentAction.type) {
          case ActionType.On:
            await controlAllLights({
              controlType: ControlType.On,
              color: currentAction.color,
              brightness: currentAction.brightness,
              event,
              eventAction: currentAction,
            });
            break;
          case ActionType.Off:
            await controlAllLights({
              controlType: ControlType.Off,
              event,
              eventAction: currentAction,
            });
            break;
          case ActionType.Delay:
            await sleep(currentAction.delay ?? 0);
            break;
          case ActionType.GoBackToCurrentStatus:
            switch (liveTimingState?.TrackStatus.Status) {
              case "1":
                eventHandler(EventType.GreenFlag);
                break;
              case "2":
                eventHandler(EventType.YellowFlag);
                break;
              case "4":
                eventHandler(EventType.SafetyCar);
                break;
              case "5":
                eventHandler(EventType.RedFlag);
                break;
              case "6":
                eventHandler(EventType.VirtualSafetyCar);
                break;
              case "7":
                eventHandler(EventType.VirtualSafetyCarEnding);
                break;
            }
            break;
        }
      }
    }
  }
}
