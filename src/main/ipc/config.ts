import {
  accessSync,
  constants,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { access, mkdir, readFile, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { isEqual } from "lodash";
import { app, ipcMain, shell } from "electron";
import packageJson from "../../../package.json";
import { IConfig, IOTAConfigPayload } from "../../shared/config/config_types";
import { defaultConfig } from "../../shared/config/defaultConfig";
import { broadcastToAllWindows } from "../utils/broadcastToAllWindows";

const configPath = path.join(
  app.getPath("appData"),
  app.getName(),
  "config.json",
);
let otaDefaultConfig: Partial<IConfig> = {};
let otaOverrideConfig: Partial<IConfig> = {};
let globalConfig = {
  ...defaultConfig,
  ...readConfigSync(),
  ...otaDefaultConfig,
  ...otaOverrideConfig,
};

/**
 * Removes keys from configuration that are equal to defaults
 *
 * @param config The configuration
 */
function removeDefaults<T extends Record<string, any>>(config: T): T {
  return Object.fromEntries(
    Object.entries(config).filter(
      ([key, value]) => !isEqual(defaultConfig[key], value),
    ),
  ) as T;
}

async function hasConfig() {
  try {
    await access(configPath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function hasConfigSync() {
  try {
    accessSync(configPath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function readConfig(): Promise<IConfig> {
  try {
    const configJSON = await readFile(configPath, "utf8");
    return JSON.parse(configJSON);
  } catch {
    return defaultConfig;
  }
}

function readConfigSync(): IConfig {
  try {
    const configJSON = readFileSync(configPath, "utf8");
    return JSON.parse(configJSON);
  } catch {
    return defaultConfig;
  }
}

async function getConfig() {
  if (!(await hasConfig())) return defaultConfig;
  const config = await readConfig();
  return {
    ...defaultConfig,
    ...otaDefaultConfig,
    ...config,
    ...otaOverrideConfig,
  };
}

function getConfigSync() {
  if (!hasConfigSync()) return defaultConfig;
  const config = readConfigSync();
  return {
    ...defaultConfig,
    ...otaDefaultConfig,
    ...config,
    ...otaOverrideConfig,
  };
}

async function setConfig(config: IConfig) {
  const configJSON = JSON.stringify(removeDefaults(config));
  broadcastToAllWindows("f1mvli:config:change", config);
  await mkdir(path.dirname(configPath), { recursive: true });
  await writeFile(configPath, configJSON);
  globalConfig = {
    ...defaultConfig,
    ...otaDefaultConfig,
    ...removeDefaults(config),
    ...otaOverrideConfig,
  };
}

function setConfigSync(config: IConfig) {
  const configJSON = JSON.stringify(removeDefaults(config));
  broadcastToAllWindows("f1mvli:config:change", config);
  mkdirSync(path.dirname(configPath), { recursive: true });
  writeFileSync(configPath, configJSON);
  globalConfig = {
    ...defaultConfig,
    ...otaDefaultConfig,
    ...removeDefaults(config),
    ...otaOverrideConfig,
  };
}

async function setOTAConfig(otaConfig: IOTAConfigPayload) {
  if (otaConfig.default_config) {
    otaDefaultConfig = otaConfig.default_config;
  }
  if (otaConfig.override_config) {
    otaOverrideConfig = otaConfig.override_config;
  }
  const config = await getConfig();
  broadcastToAllWindows("f1mvli:config:change", globalConfig);
  globalConfig = {
    ...defaultConfig,
    ...otaDefaultConfig,
    ...config,
    ...otaOverrideConfig,
  };
}

async function handleConfigGet(): Promise<IConfig> {
  return getConfig();
}

async function handleConfigSet(_event: Electron.Event, config: IConfig) {
  return setConfig(config);
}

async function handleConfigReset() {
  await setConfig(defaultConfig);
}

async function handleConfigOpen() {
  await shell.openPath(configPath);
}

async function fetchAuthoritativeConfig() {
  const config = await getConfig();
  const platform = os
    .platform()
    .replace("win32", "windows")
    .replace("darwin", "mac");
  const version = packageJson.version;

  for (const hostname of config.authoritativeHostnames) {
    const url = new URL(
      `/api/v2/f1mvli/ota-config/${platform}/${version}`,
      hostname,
    );
    try {
      const response = await fetch(url.toString());
      if (response.status === 200) {
        const json = (await response.json()) as IOTAConfigPayload;
        setOTAConfig(json);
        return json;
      }
    } catch (err) {
      return;
    }
  }
}

function registerConfigIPCHandlers() {
  ipcMain.handle("f1mvli:config:get", handleConfigGet);
  ipcMain.handle("f1mvli:config:set", handleConfigSet);
  ipcMain.handle("f1mvli:config:reset", handleConfigReset);
  ipcMain.handle("f1mvli:config:open", handleConfigOpen);

  return function () {
    ipcMain.removeHandler("f1mvli:config:get");
    ipcMain.removeHandler("f1mvli:config:set");
    ipcMain.removeHandler("f1mvli:config:reset");
    ipcMain.removeHandler("f1mvli:config:open");
  };
}

export {
  globalConfig,
  otaDefaultConfig,
  otaOverrideConfig,
  getConfig,
  getConfigSync,
  setConfig,
  setConfigSync,
  handleConfigGet,
  handleConfigSet,
  fetchAuthoritativeConfig,
  registerConfigIPCHandlers,
};
