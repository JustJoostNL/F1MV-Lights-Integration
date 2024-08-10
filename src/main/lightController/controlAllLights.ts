import { Action, EventType } from "../../shared/config/config_types";
import { getConfig } from "../ipc/config";
import { goveeControl } from "./integrations/govee/api";
import { homeAssistantControl } from "./integrations/homeAssistant/api";
import { mqttControl } from "./integrations/mqtt/api";
import { openrgbControl } from "./integrations/openrgb/api";
import { philipsHueControl } from "./integrations/philipsHue/api";
import { streamdeckControl } from "./integrations/streamdeck/api";
import { tradfriControl } from "./integrations/tradfri/api";
import { webServerControl } from "./integrations/webserver/api";
import { wledControl } from "./integrations/wled/api";

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
  eventAction: Action;
}

const fallBackEvent = EventType.GreenFlag;

export async function controlAllLights({
  color,
  brightness: initialBrightness,
  controlType,
  event,
  eventAction,
}: ControlAllLightsArgs) {
  if (controlType === ControlType.Off) {
    await turnOffAllLights();
    return;
  }

  const config = await getConfig();

  const globalMaxBrightness = config.globalMaxBrightness;
  const brightness = initialBrightness
    ? (initialBrightness / 100) * globalMaxBrightness
    : globalMaxBrightness;

  if (!color || !brightness || !controlType) return;

  if (config.homeAssistantEnabled) {
    await homeAssistantControl({
      controlType,
      color,
      brightness,
      event,
    });
  }

  if (config.philipsHueEnabled) {
    await philipsHueControl({
      controlType,
      color,
      brightness,
      eventAction,
    });
  }

  if (config.webserverEnabled) {
    await webServerControl({
      color,
    });
  }

  if (config.goveeEnabled) {
    await goveeControl({
      controlType,
      color,
      brightness,
    });
  }

  if (config.streamdeckEnabled) {
    await streamdeckControl({
      controlType,
      color,
      brightness,
    });
  }

  if (config.openrgbEnabled) {
    await openrgbControl({
      controlType,
      color,
    });
  }

  if (config.mqttEnabled) {
    await mqttControl({
      controlType,
      color,
      brightness,
      event,
    });
  }

  if (config.ikeaEnabled) {
    await tradfriControl({
      controlType,
      color,
      brightness,
      event,
    });
  }

  if (config.wledEnabled) {
    await wledControl({
      controlType,
      color,
      brightness,
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

  if (config.webserverEnabled) {
    await webServerControl({
      color: {
        r: 0,
        g: 0,
        b: 0,
      },
    });
  }

  if (config.philipsHueEnabled) {
    await philipsHueControl({
      controlType: ControlType.Off,
      color: {
        r: 0,
        g: 0,
        b: 0,
      },
      brightness: 100,
    });
  }

  if (config.goveeEnabled) {
    await goveeControl({
      controlType: ControlType.Off,
      color: {
        r: 0,
        g: 0,
        b: 0,
      },
      brightness: 100,
    });
  }

  if (config.streamdeckEnabled) {
    await streamdeckControl({
      controlType: ControlType.Off,
      color: {
        r: 0,
        g: 0,
        b: 0,
      },
      brightness: 100,
    });
  }

  if (config.openrgbEnabled) {
    await openrgbControl({
      controlType: ControlType.Off,
      color: {
        r: 0,
        g: 0,
        b: 0,
      },
    });
  }

  if (config.mqttEnabled) {
    await mqttControl({
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

  if (config.ikeaEnabled) {
    await tradfriControl({
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

  if (config.wledEnabled) {
    await wledControl({
      controlType: ControlType.Off,
      color: {
        r: 0,
        g: 0,
        b: 0,
      },
      brightness: 100,
    });
  }
}
