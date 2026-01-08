import { ipcRenderer } from "electron";
import { EventType } from "../shared/types/config";

function simulate(event: EventType): Promise<void> {
  return ipcRenderer.invoke("f1mvli:eventManager:simulate", event);
}

function simulateBackToStatic(): Promise<void> {
  return ipcRenderer.invoke("f1mvli:eventManager:simulate:static");
}

function allOff(): Promise<void> {
  return ipcRenderer.invoke("f1mvli:eventManager:all-off");
}

export const eventManagerAPI = {
  simulate,
  simulateBackToStatic,
  allOff,
};
