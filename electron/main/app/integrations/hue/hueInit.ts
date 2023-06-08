import { configVars, handleConfigSet } from "../../../config/config";
import log from "electron-log";
import { hueVars, integrationStates } from "../../vars/vars";
const hue = require("node-hue-api").api;

export default async function hueInitialize(){
  let errorCheck = false;
  let hueClient;
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

  try {
    hueClient = await hue.createLocal(hueBridgeIP).connect();
  } catch (e) {
    log.error(`An error occurred while trying to create a local connection to the Philips Hue bridge: ${e.message}`);
    errorCheck = true;
    return {
      status: "error",
      message: `An error occurred while trying to create a local connection to the Philips Hue bridge: ${e.message}`
    };
  }

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

  try {
    authHueAPI = await hue.createLocal(hueBridgeIP).connect(token);
  } catch (e) {
    log.error(`An error occurred while trying to create a local connection to the Philips Hue bridge: ${e.message}`);
    errorCheck = true;
    return {
      status: "error",
      message: `An error occurred while trying to create a local connection to the Philips Hue bridge: ${e.message}`
    };
  }
  hueVars.authHueAPI = authHueAPI;
  integrationStates.hueOnline = true;
  let hueLights;
  let hueEntertainmentZones;
  try {
    hueLights = await authHueAPI.lights.getAll();
    hueEntertainmentZones = await authHueAPI.groups.getEntertainment();
  } catch (e) {
    log.error(`An error occurred while getting the Hue devices: ${e}`);
  }

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