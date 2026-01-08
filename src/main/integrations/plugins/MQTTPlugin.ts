import * as mqtt from "mqtt";
import { BaseIntegrationPlugin } from "../BaseIntegrationPlugin";
import { getConfig } from "../../ipc/config";
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
  private errorCheck: boolean = false;
  private errorMessage = "";

  async initialize(): Promise<void> {
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
      if (this.client?.connected) {
        this.client.removeAllListeners();
        this.client.end();
      }

      this.client = mqtt.connect(`mqtt://${host}`, {
        port: mqttBrokerPort,
        username: mqttBrokerUsername || undefined,
        password: mqttBrokerPassword || undefined,
      });

      this.client.on("connect", () => this.onConnect());
      this.client.on("offline", () => this.onOffline());
      this.client.on("error", (err) => this.onError(err));
    } catch (error) {
      this.setOnline(false);
      this.log("error", `Failed to connect to MQTT broker: ${error}`);
    }
  }

  async shutdown(): Promise<void> {
    if (this.client) {
      this.client.removeAllListeners();
      this.client.end();
      this.client = undefined;
    }
    await super.shutdown();
  }

  async healthCheck(): Promise<IntegrationHealthStatus> {
    return this.client?.connected ? "online" : "offline";
  }

  async control(args: IntegrationControlArgs): Promise<void> {
    if (!this._isOnline || !this.client) {
      this.log("error", "Cannot send MQTT message, not connected.");
      return;
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

  private onConnect(): void {
    this.setOnline(true);
    this.errorCheck = false;

    try {
      this.client?.publish(
        "F1MV-Lights-Integration/appstate",
        JSON.stringify({ active: true }),
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.log("error", `Error sending appstate to MQTT: ${errorMessage}`);
    }

    this.log("debug", "Successfully connected to the MQTT broker.");
  }

  private onOffline(): void {
    this.setOnline(false);
    this.log("debug", "Disconnected from the MQTT broker.");
  }

  private onError(err: Error): void {
    if (!this.errorCheck && this.errorMessage !== err.message) {
      this.errorCheck = true;
      this.errorMessage = err.message;
      this.setOnline(false);
      this.log("error", `MQTT error: ${err.message}`);
    }
  }
}

export const mqttPlugin = new MQTTPlugin();
