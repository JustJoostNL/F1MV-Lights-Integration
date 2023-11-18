import { ipcRenderer } from "electron";
import { UpdateCheckResult } from "electron-updater";
import { IConfig } from "../shared/config/IConfig";

export const f1mvli = {
  config: {
    set: (value: Partial<IConfig>): Promise<void> =>
      ipcRenderer.invoke("f1mvli:config:set", value),
    get: (): Promise<IConfig> => ipcRenderer.invoke("f1mvli:config:get"),
    on: (channel: string, listener: (...args: any[]) => void) =>
      ipcRenderer.on(channel, listener),
    reset: (): Promise<void> => ipcRenderer.invoke("f1mvli:config:reset"),
    open: (): Promise<void> => ipcRenderer.invoke("f1mvli:config:open"),
  },
  updater: {
    checkForUpdates: (): Promise<UpdateCheckResult> =>
      ipcRenderer.invoke("f1mvli:updater:checkForUpdates"),
    getUpdateAvailable: (): Promise<boolean> =>
      ipcRenderer.invoke("f1mvli:updater:getUpdateAvailable"),
    quitAndInstall: (): Promise<void> =>
      ipcRenderer.invoke("f1mvli:updater:quitAndInstall"),
  },
  logger: {
    openLogFile: (): Promise<void> => ipcRenderer.invoke("f1mvli:log:open"),
    getLogs: (): Promise<string[]> => ipcRenderer.invoke("f1mvli:log:get"),
  },
  appInfo: {
    getAppVersion: (): Promise<string> =>
      ipcRenderer.invoke("f1mvli:appInfo:getAppVersion"),
  },
  utils: {
    getIntegrationStates: () =>
      ipcRenderer.invoke("f1mvli:utils:getIntegrationStates"),
    getWindowSizes: (): Promise<number[][]> =>
      ipcRenderer.invoke("f1mvli:utils:getWindowSizes"),
    relaunchApp: (): Promise<void> =>
      ipcRenderer.invoke("f1mvli:utils:relaunchApp"),
    exitApp: (): Promise<void> => ipcRenderer.invoke("f1mvli:utils:exitApp"),
  },
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
      reConnect: () => ipcRenderer.invoke("integrations:openrgb:reConnect"),
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
