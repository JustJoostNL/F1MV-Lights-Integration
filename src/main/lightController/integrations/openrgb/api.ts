import { Client } from "openrgb-sdk";
import log from "electron-log";
import { globalConfig } from "../../../ipc/config";
import { integrationStates } from "../states";
import { ControlType } from "../../controlAllLights";
import { IOpenRGBClient } from "./types";

let openrgbClient: IOpenRGBClient | undefined = undefined;

export interface OpenRGBControlArgs {
  controlType: ControlType;
  color: {
    r: number;
    g: number;
    b: number;
  };
}

export async function openrgbInitialize() {
  try {
    if (integrationStates.openrgb) {
      log.debug("Already connected to OpenRGB, closing current connection...");
      openrgbClient?.disconnect();
    } else {
      log.debug("Connecting to OpenRGB...");
    }
    openrgbClient = new Client(
      "F1MV Lights Integration",
      globalConfig.openrgbServerPort,
      globalConfig.openrgbServerIp,
    );
    await openrgbClient.connect().then(() => {
      integrationStates.openrgb = true;
    });
  } catch (err) {
    integrationStates.openrgb = false;
    log.error(
      "Error: Could not connect to OpenRGB, please make sure that the OpenRGB SDK server is running and that the hostname/ip + port are correct!",
    );
  }
}

export async function openrgbControl({
  controlType,
  color,
}: OpenRGBControlArgs) {
  if (!integrationStates.openrgb || !openrgbClient) {
    log.error("Error: OpenRGB is not connected!");
    return;
  }

  const openrgbDeviceCont = await openrgbClient.getControllerCount();
  log.debug(`OpenRGB has ${openrgbDeviceCont} devices`);

  switch (controlType) {
    case ControlType.On:
      for (let i = 0; i < openrgbDeviceCont; i++) {
        const device = await openrgbClient.getControllerData(i);
        // await client.updateMode(i, 0); //set to direct mode (control all devices)
        const colors = Array(device.colors.length).fill({
          red: color.r,
          green: color.g,
          blue: color.b,
        });
        openrgbClient.updateLeds(i, colors);
        log.debug(
          "Updated the state of OpenRGB device " + device.deviceId + " to on.",
        );
      }
      break;
    case ControlType.Off:
      for (let i = 0; i < openrgbDeviceCont; i++) {
        const device = await openrgbClient.getControllerData(i);
        // await client.updateMode(i, 0); //set to direct mode (control all devices)
        const colors = Array(device.colors.length).fill({
          red: 0,
          green: 0,
          blue: 0,
        });
        openrgbClient.updateLeds(i, colors);
        log.debug(
          "Updated the state of OpenRGB device " + device.deviceId + " to off.",
        );
      }
      break;
  }
}
