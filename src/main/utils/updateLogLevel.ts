import log from "electron-log";
import { IConfig } from "../../shared/types/config";

export function updateLogLevel(config: IConfig) {
  log.transports.file.level = config.debugMode ? "debug" : "info";
  if (process.env.VITE_DEV_SERVER_URL) {
    log.transports.console.level = config.debugMode ? "debug" : "info";
  }
}
