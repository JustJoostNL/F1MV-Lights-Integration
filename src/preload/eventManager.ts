import { ipcRenderer } from "electron";
import { EventType } from "../shared/config/config_types";

function simulate(event: EventType): Promise<void> {
  return ipcRenderer.invoke("f1mvli:eventManager:simulate", event);
}

function allOff(): Promise<void> {
  return ipcRenderer.invoke("f1mvli:eventManager:allOff");
}

export const eventManagerAPI = {
  simulate,
  allOff,
};
