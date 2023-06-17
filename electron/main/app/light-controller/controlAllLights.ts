import effectHandler from "../effects/effectHandler";
import { configVars } from "../../config/config";
import { goBackToStatic } from "../vars/vars";
import goBackToStaticColor from "./goBackToStatic";
import goveeControl from "../integrations/govee/goveeControl";
import { IEffectSettingsConfig } from "../../../types/EffectSettingsInterface";
import homeAssistantControl from "../integrations/home-assistant/homeAssistantControl";
import openRGBControl from "../integrations/openrgb/openRGBControl";
import webServerControl from "../integrations/webserver/webServerControl";
import streamDeckControl from "../integrations/elgato-streamdeck/streamDeckControl";
import WLEDControl from "../integrations/wled/WLEDControl";
import hueControl from "../integrations/hue/hueControl";
import ikeaControl from "../integrations/ikea/ikeaControl";
import MQTTControl from "../integrations/mqtt/MQTTControl";

export default async function controlAllLights(r, g, b, brightness, action, flag) {
  const effectSettings = configVars.effectSettings as IEffectSettingsConfig;
  const hueEnableFade = configVars.hueEnableFade;
  const hueEnableFadeWithEffects = configVars.hueEnableFadeWhenEffect;

  for (let i = 0; i < effectSettings.length; i++) {
    if (effectSettings[i].enabled) {
      if (effectSettings[i].trigger === flag) {
        const oldHueFadeState = hueEnableFade;
        if (!hueEnableFadeWithEffects) {
          configVars.hueEnableFade = false;
        }
        await effectHandler(flag);
        configVars.hueEnableFade = oldHueFadeState;
        await goBackToStaticHandler(action, flag);
        return;
      }
    }
  }

  if (!configVars.goveeDisable){
    await goveeControl(r, g, b, brightness, action);
  }
  if (!configVars.homeAssistantDisable){
    await homeAssistantControl(r, g, b, brightness, action, flag);
  }
  if (!configVars.openRGBDisable){
    await openRGBControl(r, g, b, brightness, action);
  }
  if (!configVars.webServerDisable){
    await webServerControl(r, g, b, brightness, action);
  }
  if (!configVars.streamDeckDisable){
    await streamDeckControl(r, g, b, brightness, action);
  }
  if (!configVars.WLEDDisable){
    await WLEDControl(r, g, b, brightness, action);
  }
  if (!configVars.MQTTDisable){
    await MQTTControl(r, g, b, brightness, action, flag);
  }
  if (!configVars.hueDisable){
    await hueControl(r, g, b, brightness, action);
  }
  if (!configVars.ikeaDisable){
    await ikeaControl(r, g, b, brightness, action, flag);
  }

  // -----------
  await goBackToStaticHandler(action, flag);
}

async function goBackToStaticHandler(action, flag){
  const goBackToStaticPref = configVars.goBackToStatic;
  if (goBackToStaticPref) {
    if (action === "off"){
      clearTimeout(goBackToStatic.goBackToStaticTimeout);
    }
    if (action === "off" || flag === "static"){
      return;
    }
    if (goBackToStatic.goBackToStaticRuns){
      clearTimeout(goBackToStatic.goBackToStaticTimeout);
      await goBackToStaticColor(flag);
    } else {
      goBackToStatic.goBackToStaticRuns = true;
      await goBackToStaticColor(flag);
    }
  }
}