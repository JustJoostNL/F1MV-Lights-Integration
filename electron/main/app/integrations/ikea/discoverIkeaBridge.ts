const Ikea = require("node-tradfri-client");
import log from "electron-log";
import { configVars } from "../../../config/config";
import { handleConfigSet } from "../../../config/config";
import { ikeaVars, integrationStates } from "../../vars/vars";
import ikeaCheckSpectrum from "./checkIkeaDeviceSpectrum";

export default async function discoverIkeaBridge(){
  const result = await Ikea.discoverGateway();
  let ikeaGateway = "";
  let authCheck = false;
  if (!result) {
    log.warn("No IKEA Tradfri gateway found on the local network!");
    return {
      success: false,
      status: "error",
      message: "No IKEA Tradfri gateway found on the local network!",
    };
  }
  ikeaGateway = result.addresses[0];
  const tradfriClient = new Ikea.TradfriClient(ikeaGateway, {
    watchConnection: true,
  });

  if (!configVars.ikeaIdentity && !configVars.ikeaPsk) {
    log.debug("No IKEA Tradfri identity and PSK found, generating a new pair...");
    try {
      const { identity, psk } = await tradfriClient.authenticate(configVars.ikeaSecurityCode);
      await handleConfigSet(null, "Settings.ikeaSettings.identity", identity);
      await handleConfigSet(null, "Settings.ikeaSettings.psk", psk);
      log.debug(`New IKEA Trådfri identity and PSK generated: ${identity} and ${psk}`);
      authCheck = true;
    } catch (error) {
      log.error(`Error while trying to generate IKEA Tradfri identity and PSK, please check if your settings are correct. Error: ${error.message}`);
      authCheck = false;
    }
  } else {
    log.debug("IKEA Tradfri identity and PSK found, using the ones from the config.");
    authCheck = true;
  }

  if (!authCheck) {
    log.warn("No IKEA Tradfri identity and PSK found.");
    return {
      success: false,
      status: "error",
      message: "No IKEA Tradfri identity and PSK found.",
    };
  }

  try {
    await tradfriClient.connect(configVars.ikeaIdentity, configVars.ikeaPsk);
    integrationStates.ikeaOnline = true;
  } catch (error) {
    integrationStates.ikeaOnline = false;
    log.error(`Error while trying to initialize IKEA Tradfri, please check if your settings are correct. Error: ${error.message}`);
  }

  if (!integrationStates.ikeaOnline) {
    return {
      success: false,
      status: "error",
      message: "Error while trying to initialize IKEA Tradfri.",
    };
  }

  log.debug("Successfully connected to IKEA Tradfri gateway!");
  try {
    await tradfriClient.on("device updated", (d) => {
      ikeaVars.allIkeaDevices[d.instanceId] = d;
    }).observeDevices();
  } catch (error) {
    log.error(`Error while trying to observe IKEA Tradfri devices, please check if your settings are correct. Error: ${error.message}`);
  }
  await ikeaCheckSpectrum();

  return {
    success: true,
    status: "success",
    message: "Successfully connected to the IKEA Tradfri gateway!",
  };
}