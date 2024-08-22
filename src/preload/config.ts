import { ipcRenderer } from "electron";
import { IConfig, IOTAConfigPayload } from "../shared/config/config_types";

type EventCallback = (...args: any[]) => void;

function on(event: string, callback: EventCallback) {
  const handler: EventCallback = (_event, ...args) => {
    callback(...args);
  };
  ipcRenderer.on(event, handler);
  return () => ipcRenderer.off(event, handler);
}

function set(value: Partial<IConfig>): Promise<void> {
  return ipcRenderer.invoke("f1mvli:config:set", value);
}

function get(): Promise<IConfig> {
  return ipcRenderer.invoke("f1mvli:config:get");
}

function reset(): Promise<void> {
  return ipcRenderer.invoke("f1mvli:config:reset");
}

function open(): Promise<void> {
  return ipcRenderer.invoke("f1mvli:config:open");
}

function updateOTA(): Promise<IOTAConfigPayload> {
  return ipcRenderer.invoke("f1mvli:config:ota:get");
}

export const configAPI = {
  on,
  set,
  get,
  reset,
  open,
  updateOTA,
};
