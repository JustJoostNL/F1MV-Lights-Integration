import { Action, ActionType, EventType } from "../shared/types/config";
import {
  ControlType,
  IntegrationControlArgs,
  RGBColor,
} from "../shared/types/integration";
import { getConfig } from "./ipc/config";
import { sleep } from "./utils/sleep";
import { multiViewerService, statusEventMap } from "./MultiViewerService";
import { integrationManager } from "./integrations/IntegrationManager";

export interface IOptions {
  controlType: ControlType;
  color?: RGBColor;
  brightness?: number;
  event: EventType;
  eventAction?: Action;
}

export async function controlAllLights({
  color,
  brightness: initialBrightness,
  controlType,
  event,
  eventAction,
}: IOptions): Promise<void> {
  if (controlType === ControlType.OFF) {
    await turnOffAllLights();
    return;
  }

  const config = await getConfig();
  const globalMaxBrightness = config.globalMaxBrightness;
  const brightness = initialBrightness
    ? (initialBrightness / 100) * globalMaxBrightness
    : globalMaxBrightness;

  if (!color || !brightness || !controlType) return;

  const args: IntegrationControlArgs = {
    controlType,
    color,
    brightness,
    event,
    eventAction,
  };

  await integrationManager.controlAll(args);
}

export async function turnOffAllLights(): Promise<void> {
  await integrationManager.turnOffAll();
}

export async function eventHandler(event: EventType): Promise<void> {
  const config = await getConfig();
  const events = config.events;

  for (const currentEvent of events) {
    if (!currentEvent.triggers.includes(event) || !currentEvent.enabled) {
      continue;
    }

    // Repeat for amount
    for (let j = 0; j < currentEvent.amount; j++) {
      // Loop through all actions
      for (const currentAction of currentEvent.actions) {
        switch (currentAction.type) {
          case ActionType.ON:
            await controlAllLights({
              controlType: ControlType.ON,
              color: currentAction.color,
              brightness: currentAction.brightness,
              event,
              eventAction: currentAction,
            });
            break;

          case ActionType.OFF:
            await controlAllLights({
              controlType: ControlType.OFF,
              event,
              eventAction: currentAction,
            });
            break;

          case ActionType.DELAY:
            await sleep(currentAction.delay ?? 0);
            break;

          case ActionType.GO_BACK_TO_CURRENT_STATUS: {
            const liveTimingState = multiViewerService.getLiveTimingState();
            const trackStatus = liveTimingState?.TrackStatus.Status;

            if (trackStatus && statusEventMap[trackStatus]) {
              await eventHandler(statusEventMap[trackStatus]);
            }
            break;
          }
        }
      }
    }

    if (currentEvent.goBackToStatic) {
      const delay = config.goBackToStaticDelay;
      const color = config.goBackToStaticColor;
      const brightness = config.goBackToStaticBrightness;

      if (delay) await sleep(delay);
      await controlAllLights({
        controlType: ControlType.ON,
        color,
        brightness,
        event,
        eventAction: { type: ActionType.ON },
      });
    }
  }
}
