import * as mqtt from "mqtt";
import { configVars } from "../../../config/config";
import log from "electron-log";
import { integrationStates } from "../../vars/vars";
import { MQTTVars } from "../../vars/vars";

let errorCheck = false;
let errorMessage = "";

export default async function MQTTInitialize() {
  let { MQTTHost, MQTTPort, MQTTUsername, MQTTPassword } = configVars;
  if (MQTTHost === "localhost") {
    MQTTHost = "127.0.0.1";
  }
  try {
    if (MQTTVars.client) {
      MQTTVars.client.removeListener("connect", onConnect);
      MQTTVars.client.removeListener("offline", onOffline);
      MQTTVars.client.removeListener("error", onError);
    }
    if (MQTTUsername && MQTTPassword) {
      MQTTVars.client = mqtt.connect(`mqtt://${MQTTHost}`, {
        port: MQTTPort,
        username: MQTTUsername,
        password: MQTTPassword,
      });
    } else {
      MQTTVars.client = mqtt.connect(`mqtt://${MQTTHost}`, {
        port: MQTTPort,
      });
    }
  } catch (e) {
    integrationStates.MQTTOnline = false;
    log.error("An error occurred while connecting to MQTT: " + e.message);
  }

  function onConnect() {
    integrationStates.MQTTOnline = true;
    errorCheck = false;
    try {
      MQTTVars.client.publish("F1MV-Lights-Integration/appState", JSON.stringify({
        appIsActive: true,
      }));
    } catch (e) {
      log.error("An error occurred while sending the appState to MQTT: " + e.message);
    }
    log.debug("Successfully connected to the MQTT broker.");
    errorCheck = false;
  }

  function onOffline() {
    integrationStates.MQTTOnline = false;
    log.debug("Disconnected from the MQTT broker.");
  }

  function onError(e: Error) {
    if (!errorCheck && errorMessage !== e.message) {
      errorCheck = true;
      errorMessage = e.message;
      integrationStates.MQTTOnline = false;
      log.error("An error occurred in the MQTT process: " + e.message);
    }
  }

  MQTTVars.client.on("connect", onConnect);
  MQTTVars.client.on("offline", onOffline);
  MQTTVars.client.on("error", onError);
}