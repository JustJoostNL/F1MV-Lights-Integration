import * as mqtt from "mqtt";
import log from "electron-log";
import { integrationStates, MQTTVars } from "../../vars/vars";

export default async function MQTTControl(r, g, b, brightness, action, flag) {
  if (!integrationStates.MQTTOnline) return;
  const MQTTClient: mqtt.MqttClient = MQTTVars.client;
  if (MQTTClient) {
    MQTTClient.publish("F1MV-Lights-Integration/lightState", JSON.stringify({
      colorValues: {
        red: r,
        green: g,
        blue: b,
      },
      brightness: brightness,
      action: action,
      flag: flag,
    }));
  } else {
    log.error("Can't send MQTT message, since the app is not connected to MQTT.");
  }
}
