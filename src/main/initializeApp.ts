import log from "electron-log";
import { MiscState } from "../shared/types/integration";
import { multiViewerService } from "./MultiViewerService";
import { eventHandler } from "./lightController";
import { integrationManager } from "./integrations/IntegrationManager";
import { discordPlugin } from "./integrations/plugins/DiscordPlugin";
import { goveePlugin } from "./integrations/plugins/GoveePlugin";
import { homeAssistantPlugin } from "./integrations/plugins/HomeAssistantPlugin";
import { homebridgePlugin } from "./integrations/plugins/HomebridgePlugin";
import { mqttPlugin } from "./integrations/plugins/MQTTPlugin";
import { openrgbPlugin } from "./integrations/plugins/OpenRGBPlugin";
import { philipsHuePlugin } from "./integrations/plugins/PhilipsHuePlugin";
import { streamdeckPlugin } from "./integrations/plugins/StreamDeckPlugin";
import { tradfriPlugin } from "./integrations/plugins/TradfriPlugin";
import { webserverPlugin } from "./integrations/plugins/WebserverPlugin";
import { wledPlugin } from "./integrations/plugins/WLEDPlugin";

async function handleLiveSessionCheck() {
  const response = await fetch("https://api.jstt.me/api/v2/f1tv/live-session");
  const data = await response.json();

  integrationManager.setMiscState(
    MiscState.LIVE_SESSION,
    Boolean(data.liveSessionFound),
  );
}

function registerAllPlugins(): void {
  log.info("Registering integration plugins...");

  integrationManager.registerPlugins([
    homeAssistantPlugin,
    philipsHuePlugin,
    homebridgePlugin,
    wledPlugin,
    mqttPlugin,
    goveePlugin,
    streamdeckPlugin,
    openrgbPlugin,
    tradfriPlugin,
    webserverPlugin,
    discordPlugin,
  ]);

  log.info(`Registered ${integrationManager.getAllPlugins().length} plugins`);
}

export async function initializeIntegrations(): Promise<void> {
  log.info("Initializing integrations...");

  // Initial check for F1TV live session
  await handleLiveSessionCheck();

  // Register all plugins
  registerAllPlugins();

  // Set up MultiViewer event callback
  multiViewerService.setEventCallback((event) => {
    eventHandler(event);
  });

  // Initialize all enabled integrations
  await integrationManager.initializeAll();

  // Check MultiViewer API status and start polling if online
  const isMultiViewerOnline = await multiViewerService.checkApiStatus();
  if (isMultiViewerOnline) multiViewerService.startPolling();

  // Set up periodic checks
  setInterval(async () => {
    const isOnline = await multiViewerService.checkApiStatus();

    isOnline
      ? multiViewerService.startPolling()
      : multiViewerService.stopPolling();
  }, 5000);

  // Run misc state checks periodically
  setInterval(async () => {
    await handleLiveSessionCheck();
  }, 30000);

  // Periodic health checks for all integrations
  setInterval(async () => {
    await integrationManager.healthCheckAll();
  }, 10000);

  log.info("Integration initialization complete");
}
