import { ipcRenderer } from "electron";
import { IConfig } from "../shared/config/IConfig";
import { UpdateResult } from "../shared/updater/UpdateResult";

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
    checkForUpdates: (): Promise<void> =>
      ipcRenderer.invoke("f1mvli:updater:checkForUpdates"),
    getUpdateAvailable: (): Promise<UpdateResult> =>
      ipcRenderer.invoke("f1mvli:updater:getUpdateAvailable"),
    getForceDevUpdate: (): Promise<boolean> =>
      ipcRenderer.invoke("f1mvli:updater:getForceDevUpdate"),
  },
  logger: {
    openLogFile: (): Promise<void> => ipcRenderer.invoke("f1mvli:log:open"),
    getLogs: (): Promise<string[]> => ipcRenderer.invoke("f1mvli:log:get"),
  },
  utils: {
    getIntegrationStates: () =>
      ipcRenderer.invoke("f1mvli:utils:getIntegrationStates"),
    getWindowSizes: (): Promise<number[][]> =>
      ipcRenderer.invoke("f1mvli:utils:getWindowSizes"),
    openNewWindow: (url: string): Promise<void> =>
      ipcRenderer.invoke("f1mvli:utils:openNewWindow", url),
    changeWindowTitle: (title: string): Promise<void> =>
      ipcRenderer.invoke("f1mvli:utils:changeWindowTitle", title),
    relaunchApp: (): Promise<void> =>
      ipcRenderer.invoke("f1mvli:utils:relaunchApp"),
    exitApp: (): Promise<void> => ipcRenderer.invoke("f1mvli:utils:exitApp"),
  },
  integrations: {
    homeAssistant: {
      getDevices: () =>
        ipcRenderer.invoke("integrations:homeAssistant:getDevices"),
      checkDeviceSpectrum: (entityId: string) =>
        ipcRenderer.invoke(
          "integrations:homeAssistant:checkDeviceSpectrum",
          entityId,
        ),
    },
    openRGB: {
      reConnect: () => ipcRenderer.invoke("integrations:openRGB:reConnect"),
    },
    WLED: {
      getDevices: () => ipcRenderer.invoke("integrations:WLED:getDevices"),
    },
    mqtt: {
      reConnect: () => ipcRenderer.invoke("integrations:mqtt:reConnect"),
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
