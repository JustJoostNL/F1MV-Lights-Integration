import createMultiViewerURLs from "./multiviewer/createMultiViewerURLs";
import { analyticsHandler } from "./analytics/analytics";
import startMultiViewerSync from "./multiviewer/MultiViewerLightSync";
import initAllIntegrations from "./integrations/initIntegration";
import { handleIntegrationStates, handleMiscAPIChecks } from "./integrations/integration-states/integrationStates";
import log from "electron-log";

export default async function initApp(){
  await createMultiViewerURLs();
  await analyticsHandler("getUniqueID");
  await analyticsHandler("activeUsersInit");
  await initAllIntegrations();
  await handleStates();
  setInterval(async () => {
    await handleStates();
  }, 10000);
  await startMultiViewerSync();

  log.info("App started successfully.");
}

async function handleStates() {
  await handleIntegrationStates();
  await handleMiscAPIChecks();
}