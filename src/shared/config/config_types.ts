export const eventTypeReadableMap = {
  GreenFlag: "Green Flag",
  YellowFlag: "Yellow Flag",
  RedFlag: "Red Flag",
  SafetyCar: "Safety Car",
  VirtualSafetyCar: "Virtual Safety Car",
  VirtualSafetyCarEnding: "Virtual Safety Car Ending",
  FastestLap: "Fastest Lap",
  GoBackToStatic: "Go back to static",
  SessionEnded: "Session Ended",
  ChequeredFlag: "Chequered Flag",
  BlueFlag: "Blue Flag",
  DrsEnabled: "DRS Enabled",
  DrsDisabled: "DRS Disabled",
  PitLaneEntryClosed: "Pit Lane Entry Closed",
  PitExitOpen: "Pit Exit Open",
  PitEntryClosed: "Pit Entry Closed",
  TimePenalty: "Time Penalty",
};

export enum EventType {
  GreenFlag = "GreenFlag",
  YellowFlag = "YellowFlag",
  RedFlag = "RedFlag",
  SafetyCar = "SafetyCar",
  VirtualSafetyCar = "VirtualSafetyCar",
  VirtualSafetyCarEnding = "VirtualSafetyCarEnding",
  FastestLap = "FastestLap",
  GoBackToStatic = "GoBackToStatic",
  SessionEnded = "SessionEnded",
  ChequeredFlag = "ChequeredFlag",
  BlueFlag = "BlueFlag",
  DrsEnabled = "DrsEnabled",
  DrsDisabled = "DrsDisabled",
  PitLaneEntryClosed = "PitLaneEntryClosed",
  PitExitOpen = "PitExitOpen",
  PitEntryClosed = "PitEntryClosed",
  TimePenalty = "TimePenalty",
}

export const actionTypeReadableMap = {
  On: "On",
  Off: "Off",
  Delay: "Delay",
  GoBackToCurrentStatus: "Go back to current status",
};

export enum ActionType {
  On = "On",
  off = "Off",
  Delay = "Delay",
  GoBackToCurrentStatus = "GoBackToCurrentStatus",
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
  hideLogs: boolean;
  startMultiViewerWhenAppStarts: boolean;
  events: Event[];
  multiviewerLiveTimingURL: string;
  multiviewerCheck: boolean;
  philipsHueEnabled: boolean;
  philipsHueBridgeIP: string | undefined;
  philipsHueDeviceIds: string[];
  philipsHueEntertainmentZoneIds: string[];
  philipsHueToken: string | undefined;
  philipsHueThirdPartyCompatiblityMode: boolean;
  philipsHueEnableFade: boolean;
  philipsHueEnableFadeWithEffects: boolean;
  ikeaEnabled: boolean;
  ikeaSecurityCode: string | undefined;
  ikeaIdentity: string | undefined;
  ikeaPreSharedKey: string | undefined;
  ikeaDeviceIds: string[];
  goveeEnabled: boolean;
  openrgbEnabled: boolean;
  openrgbServerIp: string;
  openrgbServerPort: number;
  homeAssistantEnabled: boolean;
  homeAssistantHost: string | undefined;
  homeAssistantPort: number;
  homeAssistantToken: string | undefined;
  homeAssistantDevices: string[];
  wledEnabled: boolean;
  wledDevices: string[];
  mqttEnabled: boolean;
  mqttBrokerHost: string | undefined;
  mqttBrokerPort: number;
  mqttBrokerUsername: string | undefined;
  mqttBrokerPassword: string | undefined;
  streamdeckEnabled: boolean;
  discordRPCEnabled: boolean;
  discordRPCAvoidSpoilers: boolean;
  webserverEnabled: boolean;
  webserverPort: number;
  debugMode: boolean;
  updateChannel: string;
  analytics: boolean;
}
