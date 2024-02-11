import { ActionType, IConfig, EventType } from "./config_types";

export const defaultConfig: IConfig = {
  hideLogs: true,
  startMultiViewerWhenAppStarts: false,
  events: [
    {
      id: 0,
      name: "Back to static",
      triggers: [EventType.GoBackToStatic],
      enabled: true,
      actions: [
        {
          type: ActionType.On,
          color: {
            r: 255,
            g: 255,
            b: 255,
          },
          brightness: 100,
        },
      ],
      amount: 1,
    },
    {
      id: 1,
      name: "Green Flag",
      triggers: [EventType.GreenFlag],
      enabled: true,
      actions: [
        {
          type: ActionType.On,
          color: {
            r: 0,
            g: 255,
            b: 0,
          },
          brightness: 100,
        },
      ],
      amount: 1,
    },
    {
      id: 2,
      name: "Yellow Flag",
      triggers: [EventType.YellowFlag],
      enabled: true,
      actions: [
        {
          type: ActionType.On,
          color: {
            r: 255,
            g: 150,
            b: 0,
          },
          brightness: 100,
        },
      ],
      amount: 1,
    },
    {
      id: 3,
      name: "Red Flag",
      triggers: [EventType.RedFlag],
      enabled: true,
      actions: [
        {
          type: ActionType.On,
          color: {
            r: 255,
            g: 0,
            b: 0,
          },
          brightness: 100,
        },
      ],
      amount: 1,
    },
    {
      id: 4,
      name: "Safety Car",
      triggers: [EventType.SafetyCar],
      enabled: true,
      actions: [
        {
          type: ActionType.On,
          color: {
            r: 255,
            g: 150,
            b: 0,
          },
          brightness: 100,
        },
      ],
      amount: 1,
    },
    {
      id: 5,
      name: "Virtual Safety Car",
      triggers: [EventType.VirtualSafetyCar],
      enabled: true,
      actions: [
        {
          type: ActionType.On,
          color: {
            r: 255,
            g: 150,
            b: 0,
          },
          brightness: 100,
        },
      ],
      amount: 1,
    },
    {
      id: 6,
      name: "Virtual Safety Car Ending",
      triggers: [EventType.VirtualSafetyCarEnding],
      enabled: true,
      actions: [
        {
          type: ActionType.On,
          color: {
            r: 255,
            g: 150,
            b: 0,
          },
          brightness: 100,
        },
      ],
      amount: 1,
    },
    {
      id: 7,
      name: "Fastest Lap",
      triggers: [EventType.FastestLap],
      enabled: true,
      actions: [
        {
          type: ActionType.On,
          color: {
            r: 91,
            g: 0,
            b: 166,
          },
          brightness: 100,
        },
        {
          type: ActionType.Delay,
          delay: 1000,
        },
        {
          type: ActionType.GoBackToCurrentStatus,
        },
      ],
      amount: 1,
    },
    {
      id: 8,
      name: "Session Ended",
      triggers: [EventType.SessionEnded],
      enabled: true,
      actions: [
        {
          type: ActionType.Off,
        },
      ],
      amount: 1,
    },
  ],
  multiviewerLiveTimingURL: "http://localhost:10101",
  multiviewerCheck: true,
  philipsHueEnabled: false,
  philipsHueBridgeIP: undefined,
  philipsHueDeviceIds: [],
  philipsHueGroupIds: [],
  philipsHueBridgeAuthToken: undefined,
  philipsHueEnableFade: false,
  ikeaEnabled: false,
  ikeaSecurityCode: undefined,
  ikeaIdentity: undefined,
  ikeaPreSharedKey: undefined,
  ikeaDeviceIds: [],
  goveeEnabled: false,
  openrgbEnabled: false,
  openrgbServerIp: "localhost",
  openrgbServerPort: 6742,
  homeAssistantEnabled: false,
  homeAssistantHost: undefined,
  homeAssistantPort: 8123,
  homeAssistantToken: undefined,
  homeAssistantDevices: [],
  wledEnabled: false,
  wledDevices: [],
  mqttEnabled: false,
  mqttBrokerHost: undefined,
  mqttBrokerPort: 1883,
  mqttBrokerUsername: undefined,
  mqttBrokerPassword: undefined,
  streamdeckEnabled: false,
  discordRPCEnabled: false,
  discordRPCAvoidSpoilers: false,
  webserverEnabled: false,
  webserverPort: 20202,
  authoritativeHostnames: ["https://api.jstt.me"],
  otaConfigFetchInterval: 120000, // 2 minutes
  otaConfigFetchJitter: 30000, // 30 seconds
  debugMode: false,
  updateChannel: "latest",
  analytics: true,
};
