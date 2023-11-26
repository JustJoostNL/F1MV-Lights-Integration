import { EventType } from "../../shared/config/config_types";
import { getConfig } from "../ipc/config";
import { homeAssistantControl } from "./integrations/homeAssistant/api";

export enum ControlType {
  On = "On",
  Off = "Off",
}

export interface ControlAllLightsArgs {
  controlType: ControlType;
  color?: {
    r: number;
    g: number;
    b: number;
  };
  brightness?: number;
  event: EventType;
}

const fallBackEvent = EventType.GreenFlag;

export async function controlAllLights({
  color,
  brightness,
  controlType,
  event,
}: ControlAllLightsArgs) {
  if (!color || !brightness || !controlType) return;

  const config = await getConfig();

  if (config.homeAssistantEnabled) {
    await homeAssistantControl({
      controlType,
      color,
      brightness,
      event,
    });
  }
}

export async function turnOffAllLights() {
  const config = await getConfig();

  if (config.homeAssistantEnabled) {
    await homeAssistantControl({
      controlType: ControlType.Off,
      color: {
        r: 0,
        g: 0,
        b: 0,
      },
      brightness: 100,
      event: fallBackEvent,
    });
  }
}
