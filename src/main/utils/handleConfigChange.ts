import log from "electron-log";
import { IConfig } from "../../shared/config/config_types";
import { homeAssistantInitialize } from "../lightController/integrations/homeAssistant/api";
import {
  closeWebServer,
  webserverInitialize,
} from "../lightController/integrations/webserver/api";
import { registerDiscordRPC } from "../lightController/integrations/discord/api";
import { goveeInitialize } from "../lightController/integrations/govee/api";
import { streamdeckInitialize } from "../lightController/integrations/streamdeck/api";
import { openrgbInitialize } from "../lightController/integrations/openrgb/api";
import {
  mqttClient,
  mqttInitialize,
} from "../lightController/integrations/mqtt/api";
import { wledInitialize } from "../lightController/integrations/wled/api";
import { homebridgeInitialize } from "../lightController/integrations/homebridge/api";

export async function handleConfigChange(
  oldConfig: IConfig,
  newConfig: IConfig,
) {
  //webserver
  if (oldConfig.webserverEnabled !== newConfig.webserverEnabled) {
    if (newConfig.webserverEnabled) {
      await webserverInitialize();
    } else {
      closeWebServer();
    }
  }

  if (oldConfig.webserverPort !== newConfig.webserverPort) {
    closeWebServer();
    await webserverInitialize();
  }

  //home assistant
  if (!oldConfig.homeAssistantEnabled && newConfig.homeAssistantEnabled) {
    await homeAssistantInitialize();
  }

  //homebridge
  if (!oldConfig.homebridgeEnabled && newConfig.homebridgeEnabled) {
    await homebridgeInitialize();
  }

  if (
    oldConfig.homebridgeHost !== newConfig.homebridgeHost ||
    oldConfig.homebridgePort !== newConfig.homebridgePort ||
    oldConfig.homebridgeUsername !== newConfig.homebridgeUsername ||
    oldConfig.homebridgePassword !== newConfig.homebridgePassword
  ) {
    await homebridgeInitialize();
  }

  //discord rpc
  if (!oldConfig.discordRPCEnabled && newConfig.discordRPCEnabled) {
    await registerDiscordRPC();
  }

  //govee
  if (!oldConfig.goveeEnabled && newConfig.goveeEnabled) {
    await goveeInitialize();
  }

  //streamdeck
  if (!oldConfig.streamdeckEnabled && newConfig.streamdeckEnabled) {
    await streamdeckInitialize();
  }

  //openrgb
  if (
    oldConfig.openrgbServerIp !== newConfig.openrgbServerIp ||
    oldConfig.openrgbServerPort !== newConfig.openrgbServerPort ||
    oldConfig.openrgbEnabled !== newConfig.openrgbEnabled
  ) {
    await openrgbInitialize();
  }

  //mqtt
  if (
    oldConfig.mqttBrokerHost !== newConfig.mqttBrokerHost ||
    oldConfig.mqttBrokerPort !== newConfig.mqttBrokerPort ||
    oldConfig.mqttBrokerUsername !== newConfig.mqttBrokerUsername ||
    oldConfig.mqttBrokerPassword !== newConfig.mqttBrokerPassword
  ) {
    await mqttInitialize();
  }

  if (!oldConfig.mqttEnabled && newConfig.mqttEnabled) {
    await mqttInitialize();
  }

  if (oldConfig.mqttEnabled && !newConfig.mqttEnabled) {
    try {
      mqttClient?.publish(
        "F1MV-Lights-Integration/appState",
        JSON.stringify({
          appIsActive: false,
        }),
      );
      mqttClient?.end();
    } catch (error: any) {
      log.error(
        "Error while setting appIsActive to false, and closing the MQTT client: " +
          error.message,
      );
    }
  }

  //wled
  if (!oldConfig.wledEnabled && newConfig.wledEnabled) {
    await wledInitialize();
  }

  //logging
  log.transports.file.level = newConfig.debugMode ? "debug" : "info";
  if (process.env.VITE_DEV_SERVER_URL) {
    log.transports.console.level = newConfig.debugMode ? "debug" : "info";
  }
}
