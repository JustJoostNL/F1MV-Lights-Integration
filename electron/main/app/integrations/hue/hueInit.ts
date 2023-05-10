import {configVars, handleConfigSet} from "../../../config/config";
import log from "electron-log";
import {hueVars, integrationStates} from "../../vars/vars";
const hue = require("node-hue-api").api;

export default async function hueInitialize(){
  const hueBridgeIP = configVars.hueBridgeIP;
  const hueToken = configVars.hueToken;
  let token;
  const hueAppName = hueVars.hueAppName;
  const hueDeviceName = hueVars.hueDeviceName;
  let authHueAPI = hueVars.authHueAPI;

  if (!hueBridgeIP || hueBridgeIP === "") {
    log.info("Philips Hue Bridge IP is not set, please use the discover button in the config to find your bridge.");
    return;
  }
  try {
    const hueClient = await hue.createLocal(hueBridgeIP).connect().catch((err: any) => {
      console.log(err);
    });

    if (!hueToken) {
      log.debug("No Philips Hue token found, generating a new one...");
      const newToken = await hueClient.users.createUser(hueAppName, hueDeviceName);
      await handleConfigSet(null, "Settings.hueSettings.hueToken", newToken.username)
      token = newToken.username;
      log.debug(`New Philips Hue token generated: ${newToken.username}`);
    } else {
      log.debug("Philips Hue token found, using that one.");
      token = configVars.hueToken;
    }

    authHueAPI = await hue.createLocal(hueBridgeIP).connect(token);
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


  } catch (error) {
    integrationStates.hueOnline = false;
    log.error(`Error while trying to initialize Philips Hue, please check if your settings are correct. Error: ${error.message}`);
  }

}