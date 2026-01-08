import { ipcRenderer } from "electron";
import {
  IntegrationPlugin,
  IntegrationHealthStatus,
  ListDevicesResponse,
  IntegrationStatesMap,
} from "../shared/types/integration";

export interface IntegrationInfo {
  id: IntegrationPlugin;
  name: string;
  isOnline: boolean;
}

function getStates(): Promise<IntegrationStatesMap> {
  return ipcRenderer.invoke("f1mvli:integrations:get-states");
}

function getAll(): Promise<IntegrationInfo[]> {
  return ipcRenderer.invoke("f1mvli:integrations:get-all");
}

function isOnline(integrationId: IntegrationPlugin): Promise<boolean> {
  return ipcRenderer.invoke("f1mvli:integrations:is-online", integrationId);
}

function healthCheck(
  integrationId: IntegrationPlugin,
): Promise<IntegrationHealthStatus> {
  return ipcRenderer.invoke("f1mvli:integrations:health-check", integrationId);
}

function listDevices(
  integrationId: IntegrationPlugin,
): Promise<ListDevicesResponse | null> {
  return ipcRenderer.invoke("f1mvli:integrations:list-devices", integrationId);
}

function callUtility<TArgs = unknown, TResult = unknown>(
  integrationId: IntegrationPlugin,
  functionName: string,
  args?: TArgs,
): Promise<TResult | null> {
  return ipcRenderer.invoke("f1mvli:integrations:call-utility", {
    integrationId,
    functionName,
    args,
  });
}

function getUtilityFunctions(): Promise<
  Record<string, { name: string; description?: string }[]>
> {
  return ipcRenderer.invoke("f1mvli:integrations:get-utility-functions");
}

function initialize(integrationId: IntegrationPlugin): Promise<boolean> {
  return ipcRenderer.invoke("f1mvli:integrations:initialize", integrationId);
}

function shutdown(integrationId: IntegrationPlugin): Promise<void> {
  return ipcRenderer.invoke("f1mvli:integrations:shutdown", integrationId);
}

function onStatesUpdated(
  callback: (states: IntegrationStatesMap) => void,
): () => void {
  const handler = (
    _event: Electron.IpcRendererEvent,
    states: IntegrationStatesMap,
  ) => {
    callback(states);
  };

  ipcRenderer.on("f1mvli:integrations:states-updated", handler);

  return () => {
    ipcRenderer.removeListener("f1mvli:integrations:states-updated", handler);
  };
}

export const integrationManagerAPI = {
  getStates,
  getAll,
  isOnline,
  healthCheck,
  listDevices,
  callUtility,
  getUtilityFunctions,
  initialize,
  shutdown,
  onStatesUpdated,
};
