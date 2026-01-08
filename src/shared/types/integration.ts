import { Action, EventType } from "./config";

export enum IntegrationPlugin {
  HOME_ASSISTANT = "homeassistant",
  HOMEBRIDGE = "homebridge",
  PHILIPSHUE = "philipshue",
  WLED = "wled",
  MQTT = "mqtt",
  GOVEE = "govee",
  STREAMDECK = "streamdeck",
  OPENRGB = "openrgb",
  TRADFRI = "tradfri",
  WEBSERVER = "webserver",
  DISCORD = "discord",
}

export const MISC_STATE_LABELS: Record<MiscState, string> = {
  multiviewer: "MultiViewer Live Timing",
  livesession: "Live session",
};

export enum MiscState {
  MULTIVIEWER = "multiviewer",
  LIVE_SESSION = "livesession",
}

export enum ControlType {
  ON = "ON",
  OFF = "OFF",
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface IntegrationControlArgs {
  controlType: ControlType;
  color: RGBColor;
  brightness: number;
  event: EventType;
  eventAction?: Action;
}

export interface IntegrationDevice {
  id: string | number;
  label: string;
  state?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ListDevicesResponse {
  devices: IntegrationDevice[];
  selectedDevices: (string | number)[];
}

export enum IntegrationHealthStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  UNKNOWN = "unknown",
}

export interface IntegrationUtilityFunction<
  TArgs = unknown,
  TResult = unknown,
> {
  name: string;
  description?: string;
  handler: (args?: TArgs) => Promise<TResult>;
}

export type IntegrationStatesMap = Record<
  IntegrationPlugin | MiscState,
  boolean
>;
