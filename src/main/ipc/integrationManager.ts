import { ipcMain } from "electron";
import {
  IntegrationPlugin,
  ListDevicesResponse,
} from "../../shared/types/integration";
import { integrationManager } from "../integrations/IntegrationManager";

function registerIntegrationManagerIPCHandlers(): () => void {
  ipcMain.handle("f1mvli:integrations:get-states", () => {
    return integrationManager.getStates();
  });

  ipcMain.handle("f1mvli:integrations:get-all", () => {
    return integrationManager.getAllPlugins().map((plugin) => ({
      id: plugin.id,
      name: plugin.name,
      isOnline: plugin.isOnline(),
    }));
  });

  ipcMain.handle(
    "f1mvli:integrations:is-online",
    (_, integrationId: IntegrationPlugin) => {
      return integrationManager.isOnline(integrationId);
    },
  );

  ipcMain.handle(
    "f1mvli:integrations:health-check",
    async (_, integrationId: IntegrationPlugin) => {
      return await integrationManager.healthCheck(integrationId);
    },
  );

  ipcMain.handle(
    "f1mvli:integrations:list-devices",
    async (
      _,
      integrationId: IntegrationPlugin,
    ): Promise<ListDevicesResponse | null> => {
      return await integrationManager.listDevices(integrationId);
    },
  );

  ipcMain.handle(
    "f1mvli:integrations:call-utility",
    async (
      _,
      args: {
        integrationId: IntegrationPlugin;
        functionName: string;
        args?: unknown;
      },
    ) => {
      return await integrationManager.callUtilityFunction(
        args.integrationId,
        args.functionName,
        args.args,
      );
    },
  );

  ipcMain.handle("f1mvli:integrations:get-utility-functions", () => {
    const functionsMap = integrationManager.getAvailableUtilityFunctions();
    const result: Record<string, { name: string; description?: string }[]> = {};

    for (const [id, functions] of functionsMap) {
      result[id] = functions;
    }

    return result;
  });

  ipcMain.handle(
    "f1mvli:integrations:initialize",
    async (_, integrationId: IntegrationPlugin) => {
      return await integrationManager.initializeIntegration(integrationId);
    },
  );

  ipcMain.handle(
    "f1mvli:integrations:shutdown",
    async (_, integrationId: IntegrationPlugin) => {
      await integrationManager.shutdownIntegration(integrationId);
    },
  );

  return () => {
    ipcMain.removeHandler("f1mvli:integrations:get-states");
    ipcMain.removeHandler("f1mvli:integrations:get-all");
    ipcMain.removeHandler("f1mvli:integrations:is-online");
    ipcMain.removeHandler("f1mvli:integrations:health-check");
    ipcMain.removeHandler("f1mvli:integrations:list-devices");
    ipcMain.removeHandler("f1mvli:integrations:call-utility");
    ipcMain.removeHandler("f1mvli:integrations:get-utility-functions");
    ipcMain.removeHandler("f1mvli:integrations:initialize");
    ipcMain.removeHandler("f1mvli:integrations:shutdown");
  };
}

export { registerIntegrationManagerIPCHandlers };
