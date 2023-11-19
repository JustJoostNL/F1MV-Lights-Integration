export interface IConfig {
  autoTurnOffLightsWhenSessionEnds: boolean;
  defaultBrightness: number;
  goBackToStatic: boolean;
  goBackToStaticEnabledEvents: string[];
  goBackToStaticDelay: number;
  staticBrightness: number;
  hideLogs: boolean;
  startMultiViewerWhenAppStarts: boolean;
  eventColors: {
    static: {
      r: number;
      g: number;
      b: number;
    };
    greenFlag: {
      r: number;
      g: number;
      b: number;
    };
    yellowFlag: {
      r: number;
      g: number;
      b: number;
    };
    redFlag: {
      r: number;
      g: number;
      b: number;
    };
    safetyCar: {
      r: number;
      g: number;
      b: number;
    };
    virtualSafetyCar: {
      r: number;
      g: number;
      b: number;
    };
    virtualSafetyCarEnding: {
      r: number;
      g: number;
      b: number;
    };
  };
  effects: {
    name: string;
    id: number;
    trigger: string;
    enabled: boolean;
    actions: {
      type: string;
      color?: {
        r: number;
        g: number;
        b: number;
      };
      brightness?: number;
      delay?: number;
    }[];
    amount: number;
  }[];
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
