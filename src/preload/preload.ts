import { configAPI } from "./config";
import { updaterAPI } from "./updater";
import { loggerAPI } from "./logger";
import { appInfoAPI } from "./appInfo";
import { utilsAPI } from "./utils";
import { eventManagerAPI } from "./eventManager";
import { integrationsAPI } from "./integrations";

export const f1mvli = {
  config: configAPI,
  updater: updaterAPI,
  logger: loggerAPI,
  appInfo: appInfoAPI,
  utils: utilsAPI,
  platform: process.platform,
  arch: process.arch,
  eventManager: eventManagerAPI,
  integrations: integrationsAPI,
};

// @ts-ignore
window.f1mvli = f1mvli;
