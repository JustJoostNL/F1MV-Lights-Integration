import { globalConfig } from "./ipc/config";
import { registerDiscordRPC } from "./lightController/integrations/discord/api";
import { goveeInitialize } from "./lightController/integrations/govee/api";
import { homeAssistantInitialize } from "./lightController/integrations/homeAssistant/api";
import { mqttInitialize } from "./lightController/integrations/mqtt/api";
import { openrgbInitialize } from "./lightController/integrations/openrgb/api";
import { philipsHueInitialize } from "./lightController/integrations/philipsHue/api";
import { integrationStates } from "./lightController/integrations/states";
import { streamdeckInitialize } from "./lightController/integrations/streamdeck/api";
import { tradfriInitialize } from "./lightController/integrations/tradfri/api";
import { webserverInitialize } from "./lightController/integrations/webserver/api";
import { wledInitialize } from "./lightController/integrations/wled/api";
import { checkMultiViewerAPIStatus } from "./multiviewer/api";
import { handleMiscIntegrationStateChecks } from "./utils/handleMiscIntegrationStateChecks";

interface Integration {
  name: string;
  function: () => Promise<void> | void;
  enabled: boolean;
}

export async function initializeIntegrations() {
  await handleMiscIntegrationStateChecks();

  const integrations: Integration[] = [
    {
      name: "homeAssistant",
      function: homeAssistantInitialize,
      enabled: globalConfig.homeAssistantEnabled,
    },
    {
      name: "philipsHue",
      function: philipsHueInitialize,
      enabled: globalConfig.philipsHueEnabled,
    },
    {
      name: "webserver",
      function: webserverInitialize,
      enabled: globalConfig.webserverEnabled,
    },
    {
      name: "govee",
      function: goveeInitialize,
      enabled: globalConfig.goveeEnabled,
    },
    {
      name: "streamdeck",
      function: streamdeckInitialize,
      enabled: globalConfig.streamdeckEnabled,
    },
    {
      name: "discord",
      function: registerDiscordRPC,
      enabled: globalConfig.discordRPCEnabled,
    },
    {
      name: "openrgb",
      function: openrgbInitialize,
      enabled: globalConfig.openrgbEnabled,
    },
    {
      name: "mqtt",
      function: mqttInitialize,
      enabled: globalConfig.mqttEnabled,
    },
    {
      name: "wled",
      function: wledInitialize,
      enabled: globalConfig.wledEnabled,
    },
    {
      name: "ikea",
      function: tradfriInitialize,
      enabled: globalConfig.ikeaEnabled,
    },
  ];

  for (const integration of integrations) {
    if (integration.enabled) {
      await integration.function();
    }
  }

  await checkMultiViewerAPIStatus().then((status) => {
    integrationStates.multiviewer = status;
  });
  setInterval(async () => {
    const apiStatus = await checkMultiViewerAPIStatus();
    integrationStates.multiviewer = apiStatus;
  }, 15000);

  setInterval(async () => {
    await handleMiscIntegrationStateChecks();
  }, 30000); // 30 seconds
}
