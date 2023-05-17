import { configVars, handleConfigSet } from "../../../config/config";
import log from "electron-log";
import { hueVars, integrationStates } from "../../vars/vars";
const hue = require("node-hue-api").api;

export default async function hueInitialize(){
  let errorCheck = false;
  const hueBridgeIP = configVars.hueBridgeIP;
  const hueToken = configVars.hueToken;
  let token;
  const hueAppName = hueVars.hueAppName;
  const hueDeviceName = hueVars.hueDeviceName;
  let authHueAPI = hueVars.authHueAPI;

  if (!hueBridgeIP || hueBridgeIP === "") {
    log.info("Philips Hue Bridge IP is not set, please use the discover button in the settings to find your bridge.");
    errorCheck = true;
    return {
      status: "error",
      message: "Philips Hue Bridge IP is not set, please use the discover button in the settings to find your bridge."
    };
  }

  const hueClient = await hue.createLocal(hueBridgeIP).connect();

  if (!hueToken) {
    log.debug("No Philips Hue token found, generating a new one...");
    const newToken = await hueClient.users.createUser(hueAppName, hueDeviceName).catch((err: any) => {
      errorCheck = true;
      if (err.message === "link button not pressed") {
        log.error("Please press the link button on your Philips Hue bridge and try again!");
        return {
          status: "error",
          message: "Please press the link button on your Philips Hue bridge and try again!"
        };
      } else {
        log.error(`Unexpected error while trying to generate a new Philips Hue token: ${err.message}`);
        return {
          status: "error",
          message: `Unexpected error while trying to generate a new Philips Hue token: ${err.message}`
        };
      }
    });
    if (!newToken.username) return newToken;
    await handleConfigSet(null, "Settings.hueSettings.token", newToken.username);
    token = newToken.username;
    log.debug(`New Philips Hue token generated: ${newToken.username}`);
  } else {
    log.debug("Philips Hue token found, using that one.");
    token = configVars.hueToken;
  }

  authHueAPI = await hue.createLocal(hueBridgeIP).connect(token);
  hueVars.authHueAPI = authHueAPI;
  integrationStates.hueOnline = true;
  const hueLights = await authHueAPI.lights.getAll();
  const hueEntertainmentZones = await authHueAPI.groups.getEntertainment();

  if (!hueLights){
    log.warn("No Philips Hue lights found, please check your settings.");
  } else {
    log.info(`Found ${hueLights.length} Philips Hue lights.`);
  }

  if (!hueEntertainmentZones){
    log.warn("No Philips Hue entertainment zones found, please check your settings.");
  } else {
    log.info(`Found ${hueEntertainmentZones.length} Philips Hue entertainment zones.`);
  }

  if (!errorCheck){
    return {
      status: "success",
      message: "Successfully connected to the Philips Hue bridge!"
    };
  }
}