import fetch from "cross-fetch";
import converter from "@q42philips/hue-color-converter";
import log from "electron-log";
import { globalConfig } from "../../../ipc/config";
import {
  HueGenerateAuthTokenResponse,
  DiscoverPhilipsHueBridgeResponse,
  DiscoveryStatus,
  GeneratePhilipsHueBridgeAuthTokenResponse,
  GenerationStatus,
  HueDiscoveryResponse,
  GetPhilipsHueDevicesResponse,
  GetPhilipsHueGroupsResponse,
  IHueClipLightResponse,
  IHueApiGroupResponse,
} from "../../../../shared/integrations/philipsHue_types";
import { integrationStates } from "../states";
import { ControlType } from "../../controlAllLights";
import { Action } from "../../../../shared/config/config_types";
import {
  fetchWithoutSSLCheck,
  fetchWithoutSSLCheckWithTimeout,
} from "../../../utils/fetch";
import { rgbToXY } from "./rgbToXyUsingGamut";

export async function discoverPhilipsHueBridge(): Promise<DiscoverPhilipsHueBridgeResponse> {
  const res = await fetch("https://discovery.meethue.com");
  const json: HueDiscoveryResponse = res.status === 200 ? await res.json() : [];
  return {
    status:
      res.status === 429
        ? DiscoveryStatus.RATE_LIMIT
        : json.length > 0
          ? DiscoveryStatus.SUCCESS
          : res.status === 200
            ? DiscoveryStatus.NO_BRIDGE_FOUND
            : DiscoveryStatus.ERROR,
    ipAddresses: json.map((device) => device.internalipaddress),
  };
}

export async function generatePhilipsHueBridgeAuthToken(): Promise<GeneratePhilipsHueBridgeAuthTokenResponse> {
  const res = await fetch(`http://${globalConfig.philipsHueBridgeIP}/api`, {
    method: "POST",
    body: JSON.stringify({
      devicetype: "f1mvlightsintegration#app",
      generateclientkey: true,
    }),
  });

  const json: HueGenerateAuthTokenResponse = await res.json();
  return {
    status:
      json[0].error?.type === 101
        ? GenerationStatus.LINK_BUTTON_NOT_PRESSED
        : json[0].success?.username
          ? GenerationStatus.SUCCESS
          : GenerationStatus.ERROR,
    username: json[0].success?.username,
  };
}

export async function philipsHueOnlineCheck(): Promise<"online" | "offline"> {
  const headers = new Headers();
  globalConfig.philipsHueBridgeAuthToken &&
    headers.append(
      "hue-application-key",
      globalConfig.philipsHueBridgeAuthToken,
    );

  try {
    const res = await fetchWithoutSSLCheckWithTimeout(
      `https://${globalConfig.philipsHueBridgeIP}/clip/v2/resource/bridge`,
      {
        headers,
      },
    );

    integrationStates.philipsHue = res.status === 200;
    return res.status === 200 ? "online" : "offline";
  } catch (err) {
    integrationStates.philipsHue = false;
    return "offline";
  }
}

export async function philipsHueInitialize() {
  const status = await philipsHueOnlineCheck();
  if (status === "online") {
    log.debug("Philips Hue API is online.");
  } else {
    log.error(
      "Error: Could not connect to the Philips Hue API, please make sure that the IP and token are correct!",
    );
  }
}

export async function getPhilipsHueDevices(): Promise<GetPhilipsHueDevicesResponse> {
  const headers = new Headers();
  globalConfig.philipsHueBridgeAuthToken &&
    headers.append(
      "hue-application-key",
      globalConfig.philipsHueBridgeAuthToken,
    );

  const res = await fetchWithoutSSLCheck(
    `https://${globalConfig.philipsHueBridgeIP}/clip/v2/resource/light`,
    {
      headers,
    },
  );
  const json: IHueClipLightResponse = await res.json();

  const devices = json.data.map((device) => ({
    id: device.id,
    name: device.metadata.name,
    state: device.on.on,
  }));

  return {
    devices,
    selectedDevices: globalConfig.philipsHueDeviceIds,
  };
}

export async function getPhilipsHueGroups(): Promise<GetPhilipsHueGroupsResponse> {
  const res = await fetch(
    `http://${globalConfig.philipsHueBridgeIP}/api/${globalConfig.philipsHueBridgeAuthToken}/groups`,
  );
  const json: IHueApiGroupResponse = await res.json();

  const groups = Object.entries(json).map(([id, group]) => ({
    id,
    name: group.name,
    state: group.state.all_on,
  }));

  return {
    groups,
    selectedGroups: globalConfig.philipsHueGroupIds,
  };
}

interface PhilipsHueControlArgs {
  controlType: ControlType;
  color: {
    r: number;
    g: number;
    b: number;
  };
  brightness: number;
  eventAction?: Action;
}

export async function philipsHueControl({
  controlType,
  color,
  brightness,
  eventAction,
}: PhilipsHueControlArgs) {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  globalConfig.philipsHueBridgeAuthToken &&
    headers.append(
      "hue-application-key",
      globalConfig.philipsHueBridgeAuthToken,
    );

  const shouldFade =
    eventAction && eventAction.philipsHueEnableFade !== undefined
      ? eventAction.philipsHueEnableFade
      : globalConfig.philipsHueEnableFade;

  for (const deviceId of globalConfig.philipsHueDeviceIds) {
    const url = new URL(
      `https://${globalConfig.philipsHueBridgeIP}/clip/v2/resource/light/${deviceId}`,
    );

    const lightRes = await fetchWithoutSSLCheck(url.toString(), {
      headers,
    });
    const lightJson: IHueClipLightResponse = await lightRes.json();
    const deviceColorGamut = lightJson.data[0].color.gamut;
    const xyUsingGamut = rgbToXY([color.r, color.g, color.b], deviceColorGamut);
    const calculatedColor: number[] = converter.calculateXY(
      color.r,
      color.g,
      color.b,
    );
    const xy = xyUsingGamut || calculatedColor;

    const body = {
      on: {
        on: controlType === ControlType.On,
      },
      dimming: {
        brightness,
      },
      color: {
        xy: {
          x: xy[0],
          y: xy[1],
        },
      },
      dynamics: !shouldFade
        ? {
            duration: 0,
          }
        : undefined,
    };

    const options = {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    };

    await fetchWithoutSSLCheck(url.toString(), options);
  }

  for (const groupId of globalConfig.philipsHueGroupIds) {
    const url = new URL(
      `https://${globalConfig.philipsHueBridgeIP}/api/${globalConfig.philipsHueBridgeAuthToken}/groups/${groupId}/action`,
    );
    const xy: number[] = converter.calculateXY(color.r, color.g, color.b);

    const body = {
      on: controlType === ControlType.On,
      xy,
      bri: Math.round((brightness / 100) * 254),
      effect: "none",
      transitiontime: globalConfig.philipsHueEnableFade ? undefined : 2,
    };

    const options = {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    };

    await fetchWithoutSSLCheck(url.toString(), options);
  }
}
