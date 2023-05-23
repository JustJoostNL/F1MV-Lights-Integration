import createF1MVURLs from "./f1mv/createF1MVURLs";
import { analyticsHandler } from "./analytics/analytics";
import startF1MVLightSync from "./f1mv/F1MVLightSync";
import initAllIntegrations from "./integrations/initIntegration";
import { handleIntegrationStates, handleMiscAPIChecks } from "./integrations/integration-states/integrationStates";
import handleDeepLinking from "./deeplinking/handleDeepLinking";
import log from "electron-log";

export default async function initApp(){
  await createF1MVURLs();
  await handleDeepLinking();
  await analyticsHandler("getUniqueID");
  await analyticsHandler("activeUsersInit");
  await initAllIntegrations();
  await handleStates();
  setInterval(async () => {
    await handleStates();
  }, 10000);
  await startF1MVLightSync();

  log.info("App started successfully.");
}

async function handleStates() {
  await handleIntegrationStates();
  await handleMiscAPIChecks();
}