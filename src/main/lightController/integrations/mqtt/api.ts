import * as mqtt from "mqtt";
import log from "electron-log";
import { getConfig } from "../../../ipc/config";
import { integrationStates } from "../states";
import { EventType } from "../../../../shared/config/config_types";
import { ControlType } from "../../controlAllLights";

export let mqttClient: mqtt.MqttClient | undefined = undefined;
let errorCheck: boolean = false;
let errorMessage = "";

export async function mqttInitialize() {
  const {
    mqttBrokerHost,
    mqttBrokerPort,
    mqttBrokerUsername,
    mqttBrokerPassword,
  } = await getConfig();

  const host = mqttBrokerHost
    ?.replace("mqtt://", "")
    .replace("localhost", "127.0.0.1");

  try {
    if (mqttClient?.connected) {
      mqttClient.removeListener("connect", onConnect);
      mqttClient.removeListener("offline", onOffline);
      mqttClient.removeListener("error", onError);
      mqttClient.end();
    }

    mqttClient = mqtt.connect(`mqtt://${host}`, {
      port: mqttBrokerPort,
      username: mqttBrokerUsername || undefined,
      password: mqttBrokerPassword || undefined,
    });

    mqttClient.on("connect", onConnect);
    mqttClient.on("offline", onOffline);
    mqttClient.on("error", onError);
  } catch (err) {
    integrationStates.mqtt = false;
    log.error("Failed to connect to MQTT broker", err);
  }
}

function onConnect() {
  integrationStates.mqtt = true;
  errorCheck = false;
  try {
    mqttClient?.publish(
      "F1MV-Lights-Integration/appState",
      JSON.stringify({
        appIsActive: true,
      }),
    );
  } catch (err) {
    log.error(
      "An error occurred while sending the appState to MQTT: " + err.message,
    );
  }
  log.debug("Successfully connected to the MQTT broker.");
}

function onOffline() {
  integrationStates.mqtt = false;
  log.debug("Disconnected from the MQTT broker.");
}

function onError(err: Error) {
  if (!errorCheck && errorMessage !== err.message) {
    errorCheck = true;
    errorMessage = err.message;
    integrationStates.mqtt = false;
    log.error("An error occurred in the MQTT process: " + err.message);
  }
}
interface MQTTControlArgs {
  controlType: ControlType;
  color: {
    r: number;
    g: number;
    b: number;
  };
  brightness: number;
  event: EventType;
}

export async function mqttControl({
  controlType,
  color,
  brightness,
  event,
}: MQTTControlArgs) {
  if (!integrationStates.mqtt || !mqttClient) {
    log.error(
      "Can't send MQTT message, since the app is not connected to MQTT.",
    );
    return;
  }

  mqttClient.publish(
    "F1MV-Lights-Integration/state",
    JSON.stringify({
      controlType,
      color,
      brightness,
      event,
    }),
  );
}
