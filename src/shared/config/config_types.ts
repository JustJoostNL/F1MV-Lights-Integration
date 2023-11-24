export const eventTypeReadableMap = {
  greenFlag: "Green Flag",
  yellowFlag: "Yellow Flag",
  redFlag: "Red Flag",
  safetyCar: "Safety Car",
  virtualSafetyCar: "Virtual Safety Car",
  virtualSafetyCarEnding: "Virtual Safety Car Ending",
  fastestLap: "Fastest Lap",
  goBackToStatic: "Go back to static",
};

export enum EventType {
  greenFlag = "greenFlag",
  yellowFlag = "yellowFlag",
  redFlag = "redFlag",
  safetyCar = "safetyCar",
  virtualSafetyCar = "virtualSafetyCar",
  virtualSafetyCarEnding = "virtualSafetyCarEnding",
  fastestLap = "fastestLap",
  goBackToStatic = "goBackToStatic",
}

export const actionTypeReadableMap = {
  on: "On",
  off: "Off",
  delay: "Delay",
  go_back_to_current_status: "Go back to current status",
};

export enum ActionType {
  on = "on",
  off = "off",
  delay = "delay",
  go_back_to_current_status = "go_back_to_current_status",
}

export interface Action {
  type: ActionType;
  color?: {
    r: number;
    g: number;
    b: number;
  };
  brightness?: number;
  delay?: number;
}
export interface Event {
  id: number;
  name: string;
  triggers: EventType[];
  enabled: boolean;
  actions: Action[];
  amount: number;
}

export interface IConfig {
  autoTurnOffLightsWhenSessionEnds: boolean;
  defaultBrightness: number;
  hideLogs: boolean;
  startMultiViewerWhenAppStarts: boolean;
  events: Event[];
  multiviewerLiveTimingURL: string;
  multiviewerCheck: boolean;
  philipsHueEnabled: boolean;
  philipsHueBridgeIP: string | undefined;
  philipsHueDeviceIDs: string[];
  philipsHueEntertainmentZoneIDs: string[];
  philipsHueToken: string | undefined;
  philipsHueThirdPartyCompatiblityMode: boolean;
  philipsHueEnableFade: boolean;
  philipsHueEnableFadeWithEffects: boolean;
  ikeaEnabled: boolean;
  ikeaSecurityCode: string;
  ikeaIdentity: string | undefined;
  ikeaPreSharedKey: string | undefined;
  ikeaDeviceIDs: string[];
  goveeEnabled: boolean;
  openrgbEnabled: boolean;
  openrgbServerIp: string;
  openrgbServerPort: number;
  homeAssistantEnabled: boolean;
  homeAssistantHost: string;
  homeAssistantPort: number;
  homeAssistantToken: string;
  homeAssistantDevices: string[];
  wledEnabled: boolean;
  wledDevices: string[];
  mqttEnabled: boolean;
  mqttHost: string;
  mqttPort: number;
  mqttUsername: string;
  mqttPassword: string;
  streamdeckEnabled: boolean;
  discordRPCEnabled: boolean;
  discordRPCAvoidSpoilers: boolean;
  webserverEnabled: boolean;
  webserverPort: number;
  debugMode: boolean;
  updateChannel: string;
  analytics: boolean;
}
