export const eventTypeReadableMap: Record<EventType, string> = {
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
  SessionStartDelayed: "Session Start Delayed",
  SessionDurationChanged: "Session Duration Changed",
  LapTimeDeleted: "Lap Time Deleted",
  LapTimeReinstated: "Lap Time Reinstated",
  LappedCarsMayOvertake: "Lapped Cars May Overtake",
  LappedCarsMayNotOvertake: "Lapped Cars May Not Overtake",
  NormalGripConditions: "Normal Grip Conditions",
  OffTrackAndContinued: "Off Track And Continued",
  SpunAndContinued: "Car Spun And Continued",
  MissedApex: "Car Missed Apex",
  CarStopped: "Car Stopped",
  MedicalCar: "Medical Car",
  IncidentNoted: "Incident Noted",
  IncidentUnderInvestigation: "Incident Under Investigation",
  IncidentInvestigationAfterSession: "Incident Investigation After Session",
  IncidentNoFurtherAction: "Incident No Further Action",
  IncidentNoFurtherInvestigation: "Incident No Further Investigation",
  StopGoPenalty: "Stop Go Penalty",
  TrackSurfaceSlippery: "Track Surface Slippery",
  LowGripConditions: "Low Grip Conditions",
  SessionStartAborted: "Session Start Aborted",
  DriveThroughPenalty: "Drive Through Penalty",
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
  SessionStartDelayed = "SessionStartDelayed",
  SessionDurationChanged = "SessionDurationChanged",
  LapTimeDeleted = "LapTimeDeleted",
  LapTimeReinstated = "LapTimeReinstated",
  LappedCarsMayOvertake = "LappedCarsMayOvertake",
  LappedCarsMayNotOvertake = "LappedCarsMayNotOvertake",
  NormalGripConditions = "NormalGripConditions",
  OffTrackAndContinued = "OffTrackAndContinued",
  SpunAndContinued = "SpunAndContinued",
  MissedApex = "MissedApex",
  CarStopped = "CarStopped",
  MedicalCar = "MedicalCar",
  IncidentNoted = "IncidentNoted",
  IncidentUnderInvestigation = "IncidentUnderInvestigation",
  IncidentInvestigationAfterSession = "IncidentInvestigationAfterSession",
  IncidentNoFurtherAction = "IncidentNoFurtherAction",
  IncidentNoFurtherInvestigation = "IncidentNoFurtherInvestigation",
  StopGoPenalty = "StopGoPenalty",
  TrackSurfaceSlippery = "TrackSurfaceSlippery",
  LowGripConditions = "LowGripConditions",
  SessionStartAborted = "SessionStartAborted",
  DriveThroughPenalty = "DriveThroughPenalty",
}

export const actionTypeReadableMap: Record<ActionType, string> = {
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
  homebridgeEnabled: boolean;
  homebridgeHost: string | undefined;
  homebridgePort: number;
  homebridgeUsername: string | undefined;
  homebridgePassword: string | undefined;
  homebridgeAccessories: string[];
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
  analytics: boolean;
}

export interface IOTAConfigPayload {
  default_config: Partial<IConfig>;
  override_config: Partial<IConfig>;
}
