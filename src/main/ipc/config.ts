import {
  accessSync,
  constants,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { access, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { isEqual } from "lodash";
import { app, ipcMain, shell } from "electron";
import { IConfig } from "../../shared/config/config_types";
import { defaultConfig } from "../../shared/config/defaultConfig";
import { broadcastToAllWindows } from "../utils/broadcastToAllWindows";

const configPath = path.join(
  app.getPath("appData"),
  app.getName(),
  "config.json",
);
let globalConfig = { ...defaultConfig, ...readConfigSync() };

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
  return { ...defaultConfig, ...config };
}

function getConfigSync() {
  if (!hasConfigSync()) return defaultConfig;
  const config = readConfigSync();
  return { ...defaultConfig, ...config };
}

async function setConfig(config: IConfig) {
  const configJSON = JSON.stringify(removeDefaults(config));
  broadcastToAllWindows("f1mvli:config:change", config);
  await mkdir(path.dirname(configPath), { recursive: true });
  await writeFile(configPath, configJSON);
  globalConfig = { ...defaultConfig, ...removeDefaults(config) };
}

function setConfigSync(config: IConfig) {
  const configJSON = JSON.stringify(removeDefaults(config));
  broadcastToAllWindows("f1mvli:config:change", config);
  mkdirSync(path.dirname(configPath), { recursive: true });
  writeFileSync(configPath, configJSON);
  globalConfig = { ...defaultConfig, ...removeDefaults(config) };
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
  getConfig,
  getConfigSync,
  setConfig,
  setConfigSync,
  handleConfigGet,
  handleConfigSet,
  registerConfigIPCHandlers,
};
