import fetch from "cross-fetch";
import log from "electron-log";
import { getConfig, globalConfig } from "../../../ipc/config";
import { integrationStates } from "../states";
import { ControlType } from "../../controlAllLights";
import { rgbToHueSat } from "../rgbToHueSat";
import {
  IHomebridgeAccessory,
  IHomebridgeAccessoryResponse,
  IHomebridgeAuthCheckResponse,
  IHomebridgeTokenResponse,
} from "../../../../shared/integrations/homebridge_types";

let storedToken: { token: string; expiry: number } | null = null;

export async function homebridgeOnlineCheck(): Promise<"online" | "offline"> {
  const url = new URL("/api/auth/check", globalConfig.homebridgeHost);
  url.port = globalConfig.homebridgePort.toString();

  const token = await requestHomebridgeToken();

  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  };

  try {
    const res = await fetch(url, options);
    const data: IHomebridgeAuthCheckResponse = await res.json();

    const isOnline = data.status === "OK";

    integrationStates.homebridge = isOnline;
    return isOnline ? "online" : "offline";
  } catch (err) {
    integrationStates.homebridge = false;
    return "offline";
  }
}

export async function requestHomebridgeToken() {
  if (storedToken && storedToken.expiry > Date.now()) {
    return storedToken.token;
  }

  const url = new URL("/api/auth/login", globalConfig.homebridgeHost);
  url.port = globalConfig.homebridgePort.toString();

  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: globalConfig.homebridgeUsername,
      password: globalConfig.homebridgePassword,
    }),
  };

  try {
    const res = await fetch(url, options);
    const data: IHomebridgeTokenResponse = await res.json();

    storedToken = {
      token: data.access_token,
      expiry: Date.now() + data.expires_in * 1000,
    };

    return data.access_token;
  } catch (err) {
    log.error(
      `An error occurred while requesting the Homebridge token: ${err}`,
    );
  }
}

export async function homebridgeInitialize() {
  log.debug("Checking if the Homebridge API is online...");

  const status = await homebridgeOnlineCheck();

  if (status === "online") {
    log.debug("Homebridge API is online.");
  } else {
    log.error(
      "Error: Could not connect to the Homebridge API, please make sure that the hostname and port are correct!",
    );
  }
}

export async function homebridgeGetAccessories() {
  const config = await getConfig();
  const url = new URL("/api/accessories", config.homebridgeHost);
  url.port = config.homebridgePort.toString();

  const token = await requestHomebridgeToken();

  const options = {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
  };

  const res = await fetch(url, options);
  const json: IHomebridgeAccessoryResponse = await res.json();

  const lightList: IHomebridgeAccessory[] = [];

  json.forEach((item) => {
    if (item.type == "Lightbulb" && homebridgeSupportsHSB(item)) {
      lightList.push(item);
    }
  });

  return {
    accessories: lightList,
    selectedAccessories: config.homebridgeAccessories,
  };
}

export function homebridgeSupportsHSB(accessory: IHomebridgeAccessory) {
  if ("Hue" in accessory.values && "Saturation" in accessory.values) {
    return true;
  }

  return false;
}

interface HomebridgeControlArgs {
  controlType: ControlType;
  color: {
    r: number;
    g: number;
    b: number;
  };
  brightness: number;
}

export async function homebridgeControl({
  controlType,
  color,
  brightness,
}: HomebridgeControlArgs) {
  if (!integrationStates.homebridge) return;

  const config = await getConfig();
  const token = await requestHomebridgeToken();

  const homebridgeAccessories = config.homebridgeAccessories;

  const headers = {
    Authorization: "Bearer " + token,
    "Content-Type": "application/json",
  };

  switch (controlType) {
    case ControlType.On:
      for (const accessory in homebridgeAccessories) {
        const uniqueId = homebridgeAccessories[accessory];

        const url = new URL(
          "/api/accessories/" + uniqueId,
          config.homebridgeHost,
        );
        url.port = config.homebridgePort.toString();

        const { hue, sat } = rgbToHueSat(color.r, color.g, color.b);

        const putData = [
          {
            characteristicType: "On",
            value: 1,
          },
          {
            characteristicType: "Hue",
            value: Math.floor(hue),
          },
          {
            characteristicType: "Saturation",
            value: Math.floor(sat),
          },
          {
            characteristicType: "Brightness",
            value: brightness,
          },
        ];

        putData.forEach(async (data) => {
          const options = {
            method: "PUT",
            headers,
            body: JSON.stringify(data),
          };

          const response = await fetch(url, options);

          if (!response.ok) {
            log.error(
              `An error occurred while turning on Homebridge device ${uniqueId}: ${response.statusText}`,
            );
          }
        });
      }
      break;
    case ControlType.Off:
      for (const accessory in homebridgeAccessories) {
        const uniqueId = homebridgeAccessories[accessory];

        const url = new URL(
          "/api/accessories/" + uniqueId,
          config.homebridgeHost,
        );
        url.port = config.homebridgePort.toString();

        const options = {
          method: "PUT",
          headers,
          body: JSON.stringify({
            characteristicType: "On",
            value: 0,
          }),
        };

        try {
          await fetch(url, options);
        } catch (err) {
          log.error(
            `An error occurred while turning off Homebridge device ${uniqueId}: ${err}`,
          );
        }
      }
      break;
  }
}
