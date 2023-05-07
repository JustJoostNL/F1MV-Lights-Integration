import { integrationStates, openRGBVars } from "../../vars/vars";
import log from "electron-log";

export default async function openRGBControl(r, g, b, brightness, action){
  if (!integrationStates.openRGBOnline){
    log.info("Can't control OpenRGB because it is not connected, please make sure that the OpenRGB SDK server is running and that the hostname/ip + port are correct!");
    return;
  }

  const openRGBDeviceCount = await openRGBVars.openRGBClient.getControllerCount();
  log.debug("Found " + openRGBDeviceCount + " OpenRGB devices.");

  switch (action) {
    case "on":
      log.debug("Turning on OpenRGB devices...");
      for (let i = 0; i < openRGBDeviceCount; i++) {
        const device = await openRGBVars.openRGBClient.getControllerData(i);
        // uncomment the below line to make sure every device is being controlled (also devices that are not in direct mode)
        // await client.updateMode(i, 0);
        const colors = Array(device.colors.length).fill({
          red: r,
          green: g,
          blue: b,
        });
        await openRGBVars.openRGBClient.updateLeds(i, colors);
        log.debug("Updated the state of OpenRGB device " + device.name + " to on.");
      }
      break;
    case "off":
      log.debug("Turning off OpenRGB devices...");
      for (let i = 0; i < openRGBDeviceCount; i++) {
        const device = await openRGBVars.openRGBClient.getControllerData(i);
        // uncomment the below line to make sure every device is being controlled (also devices that are not in direct mode)
        // await client.updateMode(i, 0);
        const colors = Array(device.colors.length).fill({
          red: 0,
          green: 0,
          blue: 0,
        });
        await openRGBVars.openRGBClient.updateLeds(i, colors);
        log.debug("Updated the state of OpenRGB device " + device.name + " to off.");
      }
  }
}