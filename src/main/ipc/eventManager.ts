import { ipcMain } from "electron";
import { eventHandler } from "../lightController/eventHandler";
import { EventType } from "../../shared/config/config_types";
import { turnOffAllLights } from "../lightController/controlAllLights";

const handleSimulate = async (event: EventType) => {
  await eventHandler(event);
};

const handleAllOff = async () => {
  await turnOffAllLights();
};

function registerEventManagerIPCHandlers() {
  ipcMain.handle("f1mvli:eventManager:simulate", (_, arg) => {
    return handleSimulate(arg);
  });
  ipcMain.handle("f1mvli:eventManager:allOff", handleAllOff);

  return function () {
    ipcMain.removeHandler("f1mvli:eventManager:simulate");
    ipcMain.removeHandler("f1mvli:eventManager:allOff");
  };
}

export { registerEventManagerIPCHandlers };
