export const eventTypeReadableMap = {
  GreenFlag: "Green Flag",
  YellowFlag: "Yellow Flag",
  RedFlag: "Red Flag",
  SafetyCar: "Safety Car",
  VirtualSafetyCar: "Virtual Safety Car",
  VirtualSafetyCarEnding: "Virtual Safety Car Ending",
  FastestLap: "Fastest Lap",
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
  GoBackToCurrentStatus: "Back to current track status",
};

export enum ActionType {
  On = "On",
  Off = "Off",
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
  philipsHueEnableFade?: boolean;
}
export interface Event {
  id: number;
  name: string;
  triggers: EventType[];
  enabled: boolean;
  actions: Action[];
  goBackToStatic?: boolean;
  amount: number;
}

export interface IConfig {
  hideLogs: boolean;
  startMultiViewerWhenAppStarts: boolean;
  globalMaxBrightness: number;
  goBackToStaticBrightness?: number;
  goBackToStaticDelay?: number;
  goBackToStaticColor?: {
    r: number;
    g: number;
    b: number;
  };
  events: Event[];
  multiviewerLiveTimingURL: string;
  multiviewerCheck: boolean;
  philipsHueEnabled: boolean;
  philipsHueBridgeIP: string | undefined;
  philipsHueDeviceIds: string[];
  philipsHueGroupIds: string[];
  philipsHueBridgeAuthToken: string | undefined;
  philipsHueEnableFade: boolean;
  ikeaEnabled: boolean;
  ikeaSecurityCode: string | undefined;
  ikeaGatewayIp: string | undefined;
  ikeaIdentity: string | undefined;
  ikeaPreSharedKey: string | undefined;
  ikeaDeviceIds: number[];
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
  authoritativeHostnames: string[];
  otaConfigFetchInterval: number;
  otaConfigFetchJitter: number;
  debugMode: boolean;
  updateChannel: string;
  analytics: boolean;
}

export interface IOTAConfigPayload {
  default_config: Partial<IConfig>;
  override_config: Partial<IConfig>;
}
