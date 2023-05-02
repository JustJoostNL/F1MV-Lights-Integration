import createF1MVURLs from "./f1mv/createF1MVURLs";
import { analyticsHandler } from "./analytics/analytics";
import startF1MVLightSync from "./f1mv/F1MVLightSync";
import initAllIntegrations from "./integrations/initIntegration";
import handleIntegrationStates from "./integrations/integration-states/integrationStates";
import log from "electron-log";

export default async function initApp(){
  await createF1MVURLs();
  await analyticsHandler("getUniqueID");
  await analyticsHandler("activeUsersInit");
  await initAllIntegrations();
  setInterval(async () => {
    await handleIntegrationStates();
  }, 3000);
  await startF1MVLightSync();

  log.info("App started successfully.");
}