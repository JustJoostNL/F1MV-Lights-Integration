import fetch from "cross-fetch";
import log from "electron-log";
import { getConfig, globalConfig } from "../../../ipc/config";
import { integrationStates } from "../states";
import { ControlType } from "../../controlAllLights";
import { rgbToColorTemp } from "../rgbToColorTemp";
import { EventType } from "../../../../shared/config/config_types";
import {
  IHomeAssistantAPIPingResponse,
  IHomeAssistantStatesResponse,
  IHomeAssistantStateResponse,
} from "../../../../shared/integrations/homeAssistant_types";
import { fetchWithTimeout } from "../../../utils/fetch";

export async function homeAssistantOnlineCheck(): Promise<
  "online" | "offline"
> {
  const headers = {
    Authorization: "Bearer " + globalConfig.homeAssistantToken,
    "Content-Type": "application/json",
  };
  const options = {
    method: "GET",
    headers,
  };

  const url = new URL("/api/", globalConfig.homeAssistantHost);
  url.port = globalConfig.homeAssistantPort.toString();

  try {
    const res = await fetchWithTimeout(url.toString(), options);
    const data: IHomeAssistantAPIPingResponse = await res.json();
    integrationStates.homeAssistant = data.message === "API running.";
    return integrationStates.homeAssistant ? "online" : "offline";
  } catch (err) {
    integrationStates.homeAssistant = false;
    return "offline";
  }
}

export async function homeAssistantInitialize() {
  log.debug("Checking if the Home Assistant API is online...");

  const status = await homeAssistantOnlineCheck();
  if (status === "online") {
    log.debug("Home Assistant API is online.");
  } else {
    log.error(
      "Error: Could not connect to the Home Assistant API, please make sure that the hostname and port are correct!",
    );
  }
}

export async function homeAssistantGetDevices() {
  const config = await getConfig();
  const url = new URL("/api/states", config.homeAssistantHost);
  url.port = config.homeAssistantPort.toString();

  const headers = {
    Authorization: "Bearer " + config.homeAssistantToken,
    "Content-Type": "application/json",
  };
  const options = {
    method: "GET",
    headers,
  };

  const res = await fetch(url, options);
  const json: IHomeAssistantStatesResponse[] = await res.json();

  const lightList: IHomeAssistantStatesResponse[] = [];

  json.forEach((item) => {
    if (item.entity_id.startsWith("light.")) {
      lightList.push(item);
    }
  });

  return {
    devices: lightList,
    selectedDevices: config.homeAssistantDevices,
  };
}

export async function homeAssistantCheckDeviceSpectrum(entityId: string) {
  const config = await getConfig();
  const url = new URL("/api/states/" + entityId, config.homeAssistantHost);
  url.port = config.homeAssistantPort.toString();

  const headers = {
    Authorization: "Bearer " + config.homeAssistantToken,
    "Content-Type": "application/json",
  };
  const options = {
    method: "GET",
    headers,
  };

  try {
    const res = await fetch(url, options);
    const data: IHomeAssistantStateResponse = await res.json();
    if (!data.attributes.supported_color_modes) return false;
    return !!data.attributes.supported_color_modes.find(
      (mode: string) =>
        mode === "rgb" || mode === "rgbw" || mode === "hs" || mode === "xy",
    );
  } catch (err) {
    log.error(
      `An error occurred while checking if Home Assistant device ${entityId} supports spectrum: ${err}`,
    );
    return false;
  }
}

interface HomeAssistantControlArgs {
  controlType: ControlType;
  color: {
    r: number;
    g: number;
    b: number;
  };
  brightness: number;
  event: EventType;
}

export async function homeAssistantControl({
  controlType,
  color,
  brightness,
  event,
}: HomeAssistantControlArgs) {
  if (!integrationStates.homeAssistant) return;

  const config = await getConfig();

  const homeAssistantDevices = config.homeAssistantDevices;
  brightness = Math.round((brightness / 100) * 254);

  const headers = {
    Authorization: "Bearer " + config.homeAssistantToken,
    "Content-Type": "application/json",
  };

  const onUrl = new URL(
    "/api/services/light/turn_on",
    config.homeAssistantHost,
  );
  onUrl.port = config.homeAssistantPort.toString();

  const offUrl = new URL(
    "/api/services/light/turn_off",
    config.homeAssistantHost,
  );
  offUrl.port = config.homeAssistantPort.toString();

  switch (controlType) {
    case ControlType.On:
      for (const device in homeAssistantDevices) {
        const entityId = homeAssistantDevices[device];
        const supportsRGB = await homeAssistantCheckDeviceSpectrum(entityId);

        let colorTemp = 0;

        if (!supportsRGB) {
          const deviceData = (await homeAssistantGetDevices()).devices;
          const foundDevice = deviceData.find(
            (item) => item.entity_id === entityId,
          );

          colorTemp = rgbToColorTemp(
            event,
            foundDevice?.attributes.min_mireds || 0,
            foundDevice?.attributes.max_mireds || 0,
          );
        }

        const postData = supportsRGB
          ? {
              entity_id: entityId,
              rgb_color: [color.r, color.g, color.b],
              brightness,
            }
          : {
              entity_id: entityId,
              color_temp: colorTemp,
              brightness,
            };

        const options = {
          method: "POST",
          headers,
          body: JSON.stringify(postData),
        };

        try {
          await fetch(onUrl, options);
        } catch (error) {
          log.error(
            `An error occurred while turning on Home Assistant device ${entityId}: ${error}`,
          );
        }
      }
      break;
    case ControlType.Off:
      for (const device in homeAssistantDevices) {
        const entityId = homeAssistantDevices[device];

        const postData = {
          entity_id: entityId,
        };

        const options = {
          method: "POST",
          headers,
          body: JSON.stringify(postData),
        };

        try {
          await fetch(offUrl, options);
        } catch (error) {
          log.error(
            `An error occurred while turning off Home Assistant device ${entityId}: ${error}`,
          );
        }
      }
      break;
  }
}
