import { IEffectSetting } from "./EffectSettingsInterface";

export interface IConfig {
  Settings: {
    generalSettings: {
      autoTurnOffLights: boolean;
      defaultBrightness: number;
      goBackToStatic: boolean;
      goBackToStaticEnabledFlags: string[];
      goBackToStaticDelay: number;
      staticBrightness: number;
      hideLogs: boolean;
      colorSettings: {
        staticColor: {
          r: number;
          g: number;
          b: number;
        };
        [key: string]: {
          r: number;
          g: number;
          b: number;
        };
      };
      effectSettings: IEffectSetting[];
    };
    MultiViewerForF1Settings: {
      liveTimingURL: string;
      f1mvCheck: boolean;
    };
    hueSettings: {
      hueDisable: boolean;
      hueBridgeIP: string | undefined;
      deviceIDs: string[];
      entertainmentZoneIDs: string[];
      token: string | undefined;
      hue3rdPartyCompatMode: boolean;
      enableFade: boolean;
      enableFadeWithEffects: boolean;
    };
    ikeaSettings: {
      ikeaDisable: boolean;
      securityCode: string;
      identity: string | undefined;
      psk: string | undefined;
      deviceIDs: number[];
    };
    goveeSettings: {
      goveeDisable: boolean;
    };
    openRGBSettings: {
      openRGBDisable: boolean;
      openRGBServerIP: string;
      openRGBServerPort: number;
    };
    homeAssistantSettings: {
      homeAssistantDisable: boolean;
      host: string;
      port: number;
      token: string;
      devices: string[];
    };
    WLEDSettings: {
      WLEDDisable: boolean;
      devices: string[];
    };
    MQTTSettings: {
      MQTTDisable: boolean;
      host: string;
      port: number;
      username: string | undefined;
      password: string | undefined;
    },
    streamDeckSettings: {
      streamDeckDisable: boolean;
    };
    discordSettings: {
      discordRPCDisable: boolean;
      avoidSpoilers: boolean;
    };
    webServerSettings: {
      webServerDisable: boolean;
      webServerPort: number;
    };
    advancedSettings: {
      debugMode: boolean;
      updateChannel: string;
      analytics: boolean;
    };
  };
  version: string;
}