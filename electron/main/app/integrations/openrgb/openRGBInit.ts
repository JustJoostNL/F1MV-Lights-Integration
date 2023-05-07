import { integrationStates } from "../../vars/vars";
import log from "electron-log";
import { openRGBVars } from "../../vars/vars";
import { Client } from "openrgb-sdk";
import { configVars } from "../../../config/config";

export default async function openRGBInitialize(){
  try {
    if (integrationStates.openRGBOnline){
      log.debug("Already connected to OpenRGB, closing current connection...");
      openRGBVars.openRGBClient.disconnect();
    } else {
      log.debug("Connecting to OpenRGB...");
    }
    openRGBVars.openRGBClient = new Client("F1MV Lights Integration", configVars.openRGBPort, configVars.openRGBHost);
    await openRGBVars.openRGBClient.connect();
    log.debug("Connected to OpenRGB.");
    integrationStates.openRGBOnline = true;
    return true;
  } catch (error) {
    integrationStates.openRGBOnline = false;
    log.error("Error: Could not connect to OpenRGB, please make sure that the OpenRGB SDK server is running and that the hostname/ip + port are correct!");
    log.error("OpenRGB Error: " + error);
    return false;
  }
}