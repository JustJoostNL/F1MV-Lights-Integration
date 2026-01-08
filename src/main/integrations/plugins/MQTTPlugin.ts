import * as mqtt from "mqtt";
import { BaseIntegrationPlugin } from "../BaseIntegrationPlugin";
import { getConfig } from "../../ipc/config";
import { IntegrationApiError } from "../utils/error";
import {
  IntegrationPlugin,
  IntegrationControlArgs,
  IntegrationHealthStatus,
  ControlType,
} from "../../../shared/types/integration";
import { IConfig } from "../../../shared/types/config";

export class MQTTPlugin extends BaseIntegrationPlugin {
  readonly id = IntegrationPlugin.MQTT;
  readonly name = "MQTT";
  readonly enabledConfigKey = "mqttEnabled";
  readonly restartConfigKeys: (keyof IConfig)[] = [
    "mqttBrokerHost",
    "mqttBrokerPort",
    "mqttBrokerUsername",
    "mqttBrokerPassword",
  ];

  private client: mqtt.MqttClient | undefined = undefined;

  async initialize(): Promise<void> {
    const config = await getConfig();
    if (!config.mqttBrokerHost) {
      throw new IntegrationApiError("MQTT broker host is not configured");
    }

    const host = config.mqttBrokerHost
      .replace("mqtt://", "")
      .replace("localhost", "127.0.0.1");

    this.log("debug", "Connecting to MQTT broker...");

    if (this.client?.connected) {
      this.client.removeAllListeners();
      this.client.end();
    }

    this.client = mqtt.connect(`mqtt://${host}`, {
      port: config.mqttBrokerPort,
      username: config.mqttBrokerUsername || undefined,
      password: config.mqttBrokerPassword || undefined,
    });

    this.client.on("connect", () => {
      this.setOnline(true);
      this.log("info", "Connected to MQTT broker");
      this.client?.publish(
        "F1MV-Lights-Integration/appstate",
        JSON.stringify({ active: true }),
      );
    });

    this.client.on("offline", () => {
      this.setOnline(false);
      this.log("debug", "Disconnected from MQTT broker");
    });

    this.client.on("error", (err) => {
      this.setOnline(false);
      this.log("warn", `MQTT connection error: ${err.message}`);
    });
  }

  async shutdown(): Promise<void> {
    if (this.client) {
      this.client.publish(
        "F1MV-Lights-Integration/appstate",
        JSON.stringify({ active: false }),
      );
      this.client.removeAllListeners();
      this.client.end();
      this.client = undefined;
    }
    await super.shutdown();
  }

  async healthCheck(): Promise<IntegrationHealthStatus> {
    const isOnline = this.client?.connected ?? false;
    this.setOnline(isOnline);
    return isOnline
      ? IntegrationHealthStatus.ONLINE
      : IntegrationHealthStatus.OFFLINE;
  }

  async control(args: IntegrationControlArgs): Promise<void> {
    if (!this._isOnline || !this.client) {
      throw new IntegrationApiError("MQTT client not connected");
    }

    const { controlType, color, brightness, event } = args;

    this.client.publish(
      "F1MV-Lights-Integration/state",
      JSON.stringify({
        on: controlType === ControlType.ON,
        color: { r: color.r, g: color.g, b: color.b },
        brightness,
        event,
      }),
    );
  }
}

export const mqttPlugin = new MQTTPlugin();
