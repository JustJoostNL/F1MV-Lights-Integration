import log from "electron-log";
import { IConfig } from "../../shared/config/config_types";
import { homeAssistantInitialize } from "../lightController/integrations/homeAssistant/api";
import {
  closeWebServer,
  webserverInitialize,
} from "../lightController/integrations/webserver/api";

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

  //logging
  log.transports.file.level = newConfig.debugMode ? "debug" : "info";
  if (process.env.VITE_DEV_SERVER_URL) {
    log.transports.console.level = newConfig.debugMode ? "debug" : "info";
  }
}
