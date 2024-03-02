import { WLEDClient } from "wled-client";
import log from "electron-log";
import { globalConfig } from "../../../ipc/config";
import { ControlType } from "../../controlAllLights";
import { integrationStates } from "../states";

export interface WLEDControlArgs {
  controlType: ControlType;
  color: {
    r: number;
    g: number;
    b: number;
  };
  brightness: number;
}

export async function wledInitialize() {
  const wledDevices = globalConfig.wledDevices;
  let successCount = 0;

  for (const deviceIp of wledDevices) {
    try {
      const device = new WLEDClient(deviceIp);
      await device.connect();
      successCount++;
      device.disconnect();
    } catch (err) {
      log.error(
        `Error while trying to initialize WLED device ${deviceIp}: ${err}`,
      );
    }
  }

  if (successCount > 0) {
    integrationStates.wled = true;
  }

  log.info(`Initialized ${successCount} WLED devices`);
}

export async function wledControl({
  controlType,
  color,
  brightness,
}: WLEDControlArgs) {
  if (!integrationStates.wled) return;

  const convertedBrightness = Math.round((brightness / 100) * 255);
  const wledDevices = globalConfig.wledDevices;

  for (const deviceIp of wledDevices) {
    try {
      const device = new WLEDClient(deviceIp);
      switch (controlType) {
        case ControlType.On:
          await device.clearSegments();
          await device.updateState({
            on: true,
            brightness: convertedBrightness,
            mainSegmentId: 0,
            segments: [
              {
                effectId: 0,
                colors: [[color.r, color.g, color.b]],
                start: 0,
                stop: device.info.leds.count,
              },
            ],
          });
          break;
        case ControlType.Off:
          await device.updateState({
            on: false,
          });
          break;
      }
      device.disconnect();
    } catch (err) {
      log.error(
        `Error while trying to control WLED device ${deviceIp}: ${err}`,
      );
    }
  }
}
