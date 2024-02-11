import { globalConfig } from "./ipc/config";
import { homeAssistantInitialize } from "./lightController/integrations/homeAssistant/api";
import { philipsHueInitialize } from "./lightController/integrations/philipsHue/api";
import { webserverInitialize } from "./lightController/integrations/webserver/api";

interface Integration {
  name: string;
  function: () => Promise<void> | void;
  enabled: boolean;
}

export async function initializeIntegrations() {
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
  ];

  for (const integration of integrations) {
    if (integration.enabled) {
      await integration.function();
    }
  }
}
