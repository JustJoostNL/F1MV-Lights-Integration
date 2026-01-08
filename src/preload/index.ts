import { configAPI } from "./config";
import { updaterAPI } from "./updater";
import { loggerAPI } from "./logger";
import { appInfoAPI } from "./appInfo";
import { utilsAPI } from "./utils";
import { eventManagerAPI } from "./eventManager";
import { integrationManagerAPI } from "./integrationManager";

export const f1mvli = {
  config: configAPI,
  updater: updaterAPI,
  logger: loggerAPI,
  appInfo: appInfoAPI,
  utils: utilsAPI,
  platform: process.platform,
  arch: process.arch,
  eventManager: eventManagerAPI,
  integrationManager: integrationManagerAPI,
};

// @ts-ignore
window.f1mvli = f1mvli;
