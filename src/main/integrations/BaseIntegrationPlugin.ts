import log from "electron-log";
import {
  IntegrationPlugin,
  IntegrationControlArgs,
  IntegrationHealthStatus,
  ListDevicesResponse,
  IntegrationUtilityFunction,
} from "../../shared/types/integration";
import { IConfig } from "../../shared/types/config";

export interface IIntegrationPlugin {
  /** Unique identifier for this integration */
  readonly id: IntegrationPlugin;

  /** Human-readable name for display */
  readonly name: string;

  /** Configuration key to check if this integration is enabled */
  readonly enabledConfigKey: keyof IConfig;

  /** Configuration keys that require app restart when changed, apart from the `enabledConfigKey` */
  readonly restartConfigKeys?: (keyof IConfig)[];

  /** Initialize the integration. Called when the integration is enabled. */
  initialize(): Promise<void>;

  /** Cleanup and disconnect. Called when the integration is disabled or app is closing. */
  shutdown?(): Promise<void>;

  /** Check if the integration is online/healthy */
  healthCheck?(): Promise<IntegrationHealthStatus>;

  /** Control lights/devices with the given parameters */
  control?(args: IntegrationControlArgs): Promise<void>;

  /** List available devices */
  listDevices?(): Promise<ListDevicesResponse>;

  /** Get utility functions provided by this integration */
  getUtilityFunctions?(): IntegrationUtilityFunction[];

  /** Whether this integration is currently online/healthy */
  isOnline(): boolean;

  /** Set the online status of this integration */
  setOnline(status: boolean): void;
}

export abstract class BaseIntegrationPlugin implements IIntegrationPlugin {
  abstract readonly id: IntegrationPlugin;
  abstract readonly name: string;
  abstract readonly enabledConfigKey: keyof IConfig;
  abstract readonly restartConfigKeys?: (keyof IConfig)[];

  protected _isOnline: boolean = false;

  abstract initialize(): Promise<void>;

  async shutdown(): Promise<void> {
    this._isOnline = false;
    this.log("debug", "Integration shutdown");
  }

  async healthCheck(): Promise<IntegrationHealthStatus> {
    return this._isOnline
      ? IntegrationHealthStatus.ONLINE
      : IntegrationHealthStatus.OFFLINE;
  }

  isOnline(): boolean {
    return this._isOnline;
  }

  setOnline(status: boolean): void {
    this._isOnline = status;
  }

  protected log(
    level: "debug" | "info" | "warn" | "error",
    message: string,
  ): void {
    log[level](`[${this.name}] ${message}`);
  }
}
