import { WLEDClient } from "wled-client";
import { configVars } from "../../../config/config";
import log from "electron-log";
import { integrationStates } from "../../vars/vars";

export default async function WLEDControl(r, g, b, brightness, action)      {
  if (!integrationStates.WLEDOnline) return;

  brightness = Math.round((brightness / 100) * 254);
  for (const device of configVars.WLEDDevices){
    try {
      const WLEDDevice = new WLEDClient(device);
      switch (action) {
        case "on":
          log.debug(`Turning on WLED device ${device}`);
          await WLEDDevice.clearSegments();
          await WLEDDevice.updateState({
            on: true,
            brightness: brightness,
            mainSegmentId: 0,
            segments: [
              {
                effectId: 0,
                colors: [[r, g, b]],
                start: 0,
                stop: WLEDDevice.info.leds.count,
              }
            ]
          });
          break;
        case "off":
          log.debug(`Turning off WLED device ${device}`);
          await WLEDDevice.updateState({
            on: false
          });
          break;
      }
      WLEDDevice.disconnect();
    } catch (error) {
      log.error(`Error while trying to control WLED device ${device}: ${error}`);
    }
  }
}