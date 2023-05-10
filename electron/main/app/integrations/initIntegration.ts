import { configVars } from "../../config/config";
import goveeInitialize from "./govee/goveeInit";
import homeAssistantInitialize from "./home-assistant/homeAssistantInit";
import openRGBInitialize from "./openrgb/openRGBInit";
import webServerInitialize from "./webserver/webServerInit";
import streamDeckInitialize from "./elgato-streamdeck/streamDeckInit";
import discordRPC from "./discord/discordRPC";
import hueInitialize from "./hue/hueInit";

export default async function initAllIntegrations(){
  const ikeaDisabled = configVars.ikeaDisable;
  const goveeDisabled = configVars.goveeDisable;
  const hueDisabled = configVars.hueDisable;
  const openRGBDisabled = configVars.openRGBDisable;
  const homeAssistantDisabled = configVars.homeAssistantDisable;
  const streamDeckDisabled = configVars.streamDeckDisable;
  const discordRPCDisabled = configVars.discordRPCDisable;
  const webServerDisabled = configVars.webServerDisable;

  function empty(){
    return;
  }

  const integrations = [
    { name: "ikea", func: empty, disabled: ikeaDisabled },
    { name: "govee", func: goveeInitialize, disabled: goveeDisabled },
    { name: "hue", func: hueInitialize, disabled: hueDisabled },
    { name: "openRGB", func: openRGBInitialize, disabled: openRGBDisabled },
    { name: "homeAssistant", func: homeAssistantInitialize, disabled: homeAssistantDisabled },
    { name: "streamDeck", func: streamDeckInitialize, disabled: streamDeckDisabled },
    { name: "discordRPC", func: discordRPC, disabled: discordRPCDisabled },
    { name: "webServer", func: webServerInitialize, disabled: webServerDisabled }
  ];

  for (const integration of integrations) {
    if (!integration.disabled) {
      await integration.func();
    }
  }
}