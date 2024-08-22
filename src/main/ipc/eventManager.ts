import { ipcMain } from "electron";
import { eventHandler } from "../lightController/eventHandler";
import { ActionType, EventType } from "../../shared/config/config_types";
import {
  ControlType,
  controlAllLights,
  turnOffAllLights,
} from "../lightController/controlAllLights";
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
    controlType: ControlType.On,
    color: config.goBackToStaticColor,
    brightness: config.goBackToStaticBrightness,
    event: EventType.GreenFlag,
    eventAction: { type: ActionType.On },
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
