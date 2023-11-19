import { ipcRenderer } from "electron";
import { configAPI } from "./config";
import { updaterAPI } from "./updater";
import { loggerAPI } from "./logger";
import { appInfoAPI } from "./appInfo";
import { utilsAPI } from "./utils";

export const f1mvli = {
  config: configAPI,
  updater: updaterAPI,
  logger: loggerAPI,
  appInfo: appInfoAPI,
  utils: utilsAPI,
  platform: process.platform,
  arch: process.arch,
  integrationApi: {
    homeassistant: {
      getDevices: () =>
        ipcRenderer.invoke("integrations:homeAssistant:getDevices"),
      checkDeviceSpectrum: (entityId: string) =>
        ipcRenderer.invoke(
          "integrations:homeAssistant:checkDeviceSpectrum",
          entityId,
        ),
    },
    openrgb: {
      reconnect: () => ipcRenderer.invoke("integrations:openrgb:reconnect"),
    },
    wled: {
      getDevices: () => ipcRenderer.invoke("integrations:wled:getDevices"),
    },
    mqtt: {
      reconnect: () => ipcRenderer.invoke("integrations:mqtt:reconnect"),
    },
    hue: {
      getLights: () => ipcRenderer.invoke("integrations:hue:getLights"),
      getEntertainmentZones: () =>
        ipcRenderer.invoke("integrations:hue:getEntertainmentZones"),
      discoverBridge: (discoverMode: "remote" | "local") =>
        ipcRenderer.invoke("integrations:hue:discoverBridge", discoverMode),
      connectToBridge: () =>
        ipcRenderer.invoke("integrations:hue:connectToBridge"),
    },
    ikea: {
      searchAndConnectToGateway: () =>
        ipcRenderer.invoke("integrations:ikea:searchAndConnectToGateway"),
      getDevices: () => ipcRenderer.invoke("integrations:ikea:getDevices"),
    },
  },
};

// @ts-ignore
window.f1mvli = f1mvli;
