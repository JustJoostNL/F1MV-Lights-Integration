import { ipcMain } from "electron";
import { ActionType, EventType } from "../../shared/types/config";
import { ControlType } from "../../shared/types/integration";
import {
  eventHandler,
  turnOffAllLights,
  controlAllLights,
} from "../lightController";
import { getConfig } from "./config";

const handleSimulate = async (event: EventType) => {
  await eventHandler(event);
};

const handleAllOff = async () => {
  await turnOffAllLights();
};

const handleSimulateBackToStatic = async () => {
  const config = await getConfig();
  await controlAllLights({
    controlType: ControlType.ON,
    color: config.goBackToStaticColor,
    brightness: config.goBackToStaticBrightness,
    event: EventType.GreenFlag,
    eventAction: { type: ActionType.ON },
  });
};

function registerEventManagerIPCHandlers() {
  ipcMain.handle("f1mvli:eventManager:simulate", (_, arg) => {
    return handleSimulate(arg);
  });
  ipcMain.handle(
    "f1mvli:eventManager:simulate:static",
    handleSimulateBackToStatic,
  );
  ipcMain.handle("f1mvli:eventManager:all-off", handleAllOff);

  return () => {
    ipcMain.removeHandler("f1mvli:eventManager:simulate");
    ipcMain.removeHandler("f1mvli:eventManager:simulate:static");
    ipcMain.removeHandler("f1mvli:eventManager:all-off");
  };
}

export { registerEventManagerIPCHandlers };
