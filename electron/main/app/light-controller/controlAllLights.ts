import effectHandler from "../effects/effectHandler";
import { configVars } from "../../config/config";
import { goBackToStatic } from "../vars/vars";
import goBackToStaticColor from "./goBackToStatic";
import goveeControl from "../integrations/govee/goveeControl";
import { IEffectSettingsConfig } from "../../../types/EffectSettingsInterface";

export default async function controlAllLights(r, g, b, brightness, action, flag) {
  const effectSettings = configVars.effectSettings as IEffectSettingsConfig;
  const hueEnableFade = configVars.hueEnableFade;
  const hueEnableFadeWithEffects = configVars.hueEnableFadeWhenEffect;

  for (let i = 0; i < effectSettings.length; i++) {
    if (effectSettings[i].enabled) {
      if (effectSettings[i].onFlag === flag) {
        const oldHueFadeState = hueEnableFade;
        if (hueEnableFadeWithEffects) {
          configVars.hueEnableFade = false;
        }
        await effectHandler(flag);
        configVars.hueEnableFade = oldHueFadeState;
        await goBackToStaticHandler(action, flag);
        return;
      }
    }
  }
  // control other lights:
  // lights come here
  if (!configVars.goveeDisable){
    await goveeControl(r, g, b, brightness, action);
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