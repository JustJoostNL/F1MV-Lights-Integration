import { ConfigMigration } from "../../types/ConfigMigrationInterface";

export const configMigrations: ConfigMigration = {
  "1.1.7": userConfig => {
    userConfig.set("version", "1.1.7");
    userConfig.set("Settings.generalSettings.goBackToStatic", true);
    userConfig.set("Settings.generalSettings.goBackToStaticDelay", 10);
    userConfig.set("Settings.generalSettings.staticBrightness", 70);
    userConfig.set("Settings.generalSettings.colorSettings.staticColor", {
      r: 255,
      g: 255,
      b: 255
    });
  },
  "1.1.8": userConfig => {
    userConfig.set("version", "1.1.8");
    userConfig.set("Settings.hueSettings.enableFade", false);
    userConfig.set("Settings.generalSettings.effectSettings", [
      {
        name: "VSC Blink Effect",
        onFlag: "vscEnding",
        enabled: true,
        actions: [
          {
            type: "on",
            color: {
              r: 0,
              g: 255,
              b: 0
            },
            brightness: 100,
          },
          {
            type: "delay",
            delay: 500,
          },
          {
            type: "on",
            color: {
              r: 255,
              g: 150,
              b: 0
            },
            brightness: 100,
          },
          {
            type: "delay",
            delay: 500,
          }
        ],
        amount: 5
      }
    ]);
  },
  "1.1.9": userConfig => {
    userConfig.set("version", "1.1.9");
    userConfig.set("Settings.homeAssistantSettings", {
      homeAssistantDisable: true,
      host: "",
      port: 8123,
      token: "",
      devices: []
    });
    userConfig.set("Settings.hueSettings.enableFadeWithEffects", false);
    userConfig.set("Settings.generalSettings.goBackToStaticEnabledFlags", [
      "green",
    ]);
  },
  "2.0.0": userConfig => {
    userConfig.set("version", "2.0.0");
    userConfig.set("Settings.discordSettings.avoidSpoilers", false);
    userConfig.delete("Settings.yeeLightSettings");
    userConfig.delete("Settings.nanoLeafSettings");
  }
};