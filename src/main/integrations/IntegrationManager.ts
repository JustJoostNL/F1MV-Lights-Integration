import log from "electron-log";
import { getConfig } from "../ipc/config";
import { broadcastToAllWindows } from "../utils/broadcastToAllWindows";
import { EventType } from "../../shared/types/config";
import {
  IntegrationPlugin,
  IntegrationControlArgs,
  IntegrationHealthStatus,
  ListDevicesResponse,
  IntegrationStatesMap,
  ControlType,
  MiscState,
} from "../../shared/types/integration";
import { IIntegrationPlugin } from "./BaseIntegrationPlugin";

const FALLBACK_EVENT = EventType.GreenFlag;

class IntegrationManager {
  private static instance: IntegrationManager;
  private plugins: Map<IntegrationPlugin, IIntegrationPlugin> = new Map();
  private initialized: boolean = false;

  private miscStates: Record<MiscState, boolean> = {
    multiviewer: false,
    livesession: false,
  };

  private constructor() {}

  static getInstance(): IntegrationManager {
    if (!IntegrationManager.instance) {
      IntegrationManager.instance = new IntegrationManager();
    }
    return IntegrationManager.instance;
  }

  /**
   * Register an integration plugin
   */
  registerPlugin(plugin: IIntegrationPlugin): void {
    if (this.plugins.has(plugin.id)) {
      log.warn(
        `Integration plugin ${plugin.id} is already registered, replacing...`,
      );
    }
    this.plugins.set(plugin.id, plugin);
    log.debug(`Registered integration plugin: ${plugin.id}`);
  }

  /**
   * Register multiple plugins at once
   */
  registerPlugins(plugins: IIntegrationPlugin[]): void {
    for (const plugin of plugins) {
      this.registerPlugin(plugin);
    }
  }

  /**
   * Get a specific plugin by ID
   */
  getPlugin(id: IntegrationPlugin): IIntegrationPlugin | undefined {
    return this.plugins.get(id);
  }

  /**
   * Get all registered plugins
   */
  getAllPlugins(): IIntegrationPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get all enabled plugin IDs based on config
   */
  async getEnabledPluginIds(): Promise<IntegrationPlugin[]> {
    const config = await getConfig();
    const enabledIds: IntegrationPlugin[] = [];

    for (const [id, plugin] of this.plugins) {
      const configKey = plugin.enabledConfigKey;
      if (config[configKey as keyof typeof config]) {
        enabledIds.push(id);
      }
    }

    return enabledIds;
  }

  /**
   * Check if a specific integration is enabled in config
   */
  async isIntegrationEnabled(id: IntegrationPlugin): Promise<boolean> {
    const config = await getConfig();
    const configKey = this.plugins.get(id)?.enabledConfigKey;
    return Boolean(config[configKey as keyof typeof config]);
  }

  /**
   * Initialize all enabled integrations
   */
  async initializeAll(): Promise<void> {
    const enabledIds = await this.getEnabledPluginIds();

    log.info(`Initializing ${enabledIds.length} enabled integrations...`);

    await Promise.all(
      enabledIds.map(async (id) => {
        await this.initializeIntegration(id);
      }),
    );

    this.initialized = true;
    this.broadcastStates();
  }

  /**
   * Initialize a specific integration
   */
  async initializeIntegration(id: IntegrationPlugin): Promise<boolean> {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      log.warn(`Cannot initialize unknown integration: ${id}`);
      return false;
    }

    try {
      log.debug(`Initializing integration: ${plugin.name}`);
      await plugin.initialize();
      log.debug(`Successfully initialized: ${plugin.name}`);
      return true;
    } catch (error) {
      log.error(`Failed to initialize ${plugin.name}: ${error}`);
      return false;
    }
  }

  /**
   * Shutdown all integrations
   */
  async shutdownAll(): Promise<void> {
    log.info("Shutting down all integrations...");

    for (const plugin of this.plugins.values()) {
      try {
        if (plugin.shutdown) await plugin.shutdown();
      } catch (error) {
        log.error(`Error shutting down ${plugin.name}: ${error}`);
      }
    }

    this.initialized = false;
  }

  /**
   * Shutdown a specific integration
   */
  async shutdownIntegration(id: IntegrationPlugin): Promise<void> {
    const plugin = this.plugins.get(id);
    if (plugin?.shutdown) {
      await plugin.shutdown();
    }
  }

  /**
   * Control all enabled integrations
   */
  async controlAll(args: IntegrationControlArgs): Promise<void> {
    const enabledIds = await this.getEnabledPluginIds();

    const promises = enabledIds.map(async (id) => {
      const plugin = this.plugins.get(id);
      if (plugin && plugin.isOnline() && plugin.control) {
        try {
          await plugin.control(args);
        } catch (error) {
          log.error(`Error controlling ${plugin.name}: ${error}`);
        }
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Turn off all lights on all enabled integrations
   */
  async turnOffAll(): Promise<void> {
    await this.controlAll({
      controlType: ControlType.OFF,
      color: { r: 0, g: 0, b: 0 },
      brightness: 100,
      event: FALLBACK_EVENT,
    });
  }

  /**
   * Run health checks on all enabled integrations
   */
  async healthCheckAll(): Promise<
    Map<IntegrationPlugin, IntegrationHealthStatus>
  > {
    const results = new Map<IntegrationPlugin, IntegrationHealthStatus>();
    const enabledIds = await this.getEnabledPluginIds();

    for (const id of enabledIds) {
      const plugin = this.plugins.get(id);
      if (plugin?.healthCheck) {
        try {
          const status = await plugin.healthCheck();
          results.set(id, status);
        } catch (error) {
          log.error(`Health check failed for ${plugin.name}: ${error}`);
          results.set(id, IntegrationHealthStatus.OFFLINE);
        }
      }
    }

    this.broadcastStates();
    return results;
  }

  /**
   * Run health check for a specific integration
   */
  async healthCheck(id: IntegrationPlugin): Promise<IntegrationHealthStatus> {
    const plugin = this.plugins.get(id);
    if (!plugin?.healthCheck) return IntegrationHealthStatus.UNKNOWN;

    try {
      const status = await plugin.healthCheck();
      this.broadcastStates();
      return status;
    } catch (error) {
      log.error(`Health check failed for ${plugin.name}: ${error}`);
      return IntegrationHealthStatus.OFFLINE;
    }
  }

  /**
   * List devices for a specific integration
   */
  async listDevices(
    id: IntegrationPlugin,
  ): Promise<ListDevicesResponse | null> {
    const plugin = this.plugins.get(id);
    if (!plugin?.listDevices) {
      return null;
    }

    try {
      return await plugin.listDevices();
    } catch (error) {
      log.error(`Failed to list devices for ${plugin.name}: ${error}`);
      return null;
    }
  }

  /**
   * Call a utility function on a specific integration
   */
  async callUtilityFunction<TArgs = unknown, TResult = unknown>(
    integrationId: IntegrationPlugin,
    functionName: string,
    args?: TArgs,
  ): Promise<TResult | null> {
    const plugin = this.plugins.get(integrationId);
    if (!plugin?.getUtilityFunctions) {
      log.warn(`Integration ${integrationId} has no utility functions`);
      return null;
    }

    const utilityFunctions = plugin.getUtilityFunctions();
    const fn = utilityFunctions.find((f) => f.name === functionName);

    if (!fn) {
      log.warn(`Unknown utility function: ${functionName} on ${plugin.name}`);
      return null;
    }

    try {
      return (await fn.handler(args)) as TResult;
    } catch (error) {
      log.error(`Error calling ${functionName} on ${plugin.name}: ${error}`);
      return null;
    }
  }

  /**
   * Get all available utility functions across all integrations
   */
  getAvailableUtilityFunctions(): Map<
    IntegrationPlugin,
    { name: string; description?: string }[]
  > {
    const result = new Map<
      IntegrationPlugin,
      { name: string; description?: string }[]
    >();

    for (const [id, plugin] of this.plugins) {
      if (!plugin.getUtilityFunctions) continue;
      const functions = plugin.getUtilityFunctions().map((f) => ({
        name: f.name,
        description: f.description,
      }));
      if (functions.length > 0) {
        result.set(id, functions);
      }
    }

    return result;
  }

  /**
   * Set a misc state
   */
  setMiscState(key: MiscState, value: boolean): void {
    this.miscStates[key] = value;
    this.broadcastStates();
  }

  /**
   * Get a misc state
   */
  getMiscState(key: MiscState): boolean {
    return this.miscStates[key] ?? false;
  }

  /**
   * Set a plugin's online status directly
   * Used for backward compatibility with the old integrationStates system
   */
  setPluginOnline(id: IntegrationPlugin, online: boolean): void {
    const plugin = this.plugins.get(id);
    if (plugin) {
      plugin.setOnline(online);
      this.broadcastStates();
    }
  }

  /**
   * Get the current state of all integrations
   */
  async getStates(): Promise<IntegrationStatesMap> {
    const states: Partial<IntegrationStatesMap> = {
      ...this.miscStates,
    };

    const enabledIds = await this.getEnabledPluginIds();

    for (const [id, plugin] of this.plugins) {
      if (!enabledIds.includes(id)) continue;
      states[id] = plugin.isOnline();
    }

    return states as IntegrationStatesMap;
  }

  /**
   * Get online status of a specific integration
   */
  isOnline(id: IntegrationPlugin): boolean {
    const plugin = this.plugins.get(id);
    return plugin?.isOnline() ?? false;
  }

  /**
   * Broadcast current states to all windows
   */
  private async broadcastStates(): Promise<void> {
    const states = await this.getStates();
    broadcastToAllWindows("f1mvli:integrations:states-updated", states);
  }

  /**
   * Check if manager has been initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

export const integrationManager = IntegrationManager.getInstance();
