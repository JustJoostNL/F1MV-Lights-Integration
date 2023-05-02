import goveeInitialize from "./govee/goveeInit";
import { configVars } from "../../config/config";

export default async function initAllIntegrations(){
  const ikeaDisabled = configVars.ikeaDisable;
  const goveeDisabled = configVars.goveeDisable;
  const hueDisabled = configVars.hueDisable;
  const openRGBDisabled = configVars.openRGBDisable;
  const homeAssistantDisabled = configVars.homeAssistantDisable;
  const streamDeckDisabled = configVars.streamDeckDisable;
  const webServerDisabled = configVars.webServerDisable;

  function empty(){
    return;
  }

  const integrations = [
    { name: "ikea", func: empty, disabled: ikeaDisabled },
    { name: "govee", func: goveeInitialize, disabled: goveeDisabled },
    { name: "hue", func: empty, disabled: hueDisabled },
    { name: "openRGB", func: empty, disabled: openRGBDisabled },
    { name: "homeAssistant", func: empty, disabled: homeAssistantDisabled },
    { name: "streamDeck", func: empty, disabled: streamDeckDisabled },
    { name: "discordRPC", func: empty, disabled: false },
    { name: "webServer", func: empty, disabled: webServerDisabled }
  ];

  for (const integration of integrations) {
    if (!integration.disabled) {
      await integration.func();
    }
  }
}