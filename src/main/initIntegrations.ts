import { globalConfig } from "./ipc/config";
import { homeAssistantInitialize } from "./lightController/integrations/homeAssistant/api";
import { webserverInitialize } from "./lightController/integrations/webserver/api";

interface Integration {
  name: string;
  function: () => Promise<void> | void;
  enabled: boolean;
  enabledCheckRepeatInterval?: number;
}

export async function initializeIntegrations() {
  const integrations: Integration[] = [
    {
      name: "homeAssistant",
      function: homeAssistantInitialize,
      enabled: globalConfig.homeAssistantEnabled,
      enabledCheckRepeatInterval: 1000 * 60 * 5, // 5 minutes
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
