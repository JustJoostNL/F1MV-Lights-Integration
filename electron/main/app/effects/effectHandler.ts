import { configVars } from "../../config/config";
import sleep from "../utils/sleep";
import controlAllLights from "../light-controller/controlAllLights";
import { IEffectSettingsConfig } from "../../../types/EffectSettingsInterface";
import { CustomColor } from "../../../types/CustomColorInterface";
import { statuses } from "../vars/vars";

export default async function effectHandler(flag){
  const effectSettings = configVars.effectSettings as IEffectSettingsConfig;
  const greenColor = configVars.greenColor as CustomColor;
  const yellowColor = configVars.yellowColor as CustomColor;
  const safetyCarColor = configVars.safetyCarColor as CustomColor;
  const redColor = configVars.redColor as CustomColor;
  const vscColor = configVars.vscColor as CustomColor;
  const vscEndingColor = configVars.vscEndingColor as CustomColor;

  for (let i = 0; i < effectSettings.length; i++) {
    // check if the effect is enabled
    if (effectSettings[i].enabled) {
      // check if the flag matches the effect
      if (effectSettings[i].trigger === flag) {
        // loop through the amount of times the effect should be run
        for (let j = 0; j < effectSettings[i].amount; j++) {
          // loop through the actions
          for (let k = 0; k < effectSettings[i].actions.length; k++) {
            // check the type of action and run the code
            switch (effectSettings[i].actions[k].type) {
              case "on":
                let flagState;
                const colorR = effectSettings[i].actions[k].color.r;
                const colorG = effectSettings[i].actions[k].color.g;
                const colorB = effectSettings[i].actions[k].color.b;
                switch (true) {
                  case colorR === greenColor.r && colorG === greenColor.g && colorB === greenColor.b:
                    flagState = "green";
                    break;
                  case colorR === yellowColor.r && colorG === yellowColor.g && colorB === yellowColor.b:
                    flagState = "yellow";
                    break;
                  case colorR === safetyCarColor.r && colorG === safetyCarColor.g && colorB === safetyCarColor.b:
                    flagState = "safetyCar";
                    break;
                  case colorR === redColor.r && colorG === redColor.g && colorB === redColor.b:
                    flagState = "red";
                    break;
                  case colorR === vscColor.r && colorG === vscColor.g && colorB === vscColor.b:
                    flagState = "vsc";
                    break;
                  case colorR === vscEndingColor.r && colorG === vscEndingColor.g && colorB === vscEndingColor.b:
                    flagState = "vscEnding";
                    break;
                  default:
                    flagState = "none";
                    break;
                }
                const brightness = effectSettings[i].actions[k].brightness;
                await controlAllLights(colorR, colorG, colorB, brightness, "on", flagState);
                break;
              case "off":
                await controlAllLights(0, 0, 0, 0, "off", "off");
                break;
              case "delay":
                const sleepDelay = effectSettings[i].actions[k].delay;
                await sleep(sleepDelay);
                break;
              case "go_back_to_current_status":
                switch (statuses.TState) {
                  case "1":
                    await controlAllLights(greenColor.r, greenColor.g, greenColor.b, configVars.defaultBrightness, "on", "green");
                    break;
                  case "2":
                    await controlAllLights(yellowColor.r, yellowColor.g, yellowColor.b, configVars.defaultBrightness, "on", "yellow");
                    break;
                  case "4":
                    await controlAllLights(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, configVars.defaultBrightness, "on", "safetyCar");
                    break;
                  case "5":
                    await controlAllLights(redColor.r, redColor.g, redColor.b, configVars.defaultBrightness, "on", "red");
                    break;
                  case "6":
                    await controlAllLights(vscColor.r, vscColor.g, vscColor.b, configVars.defaultBrightness, "on", "vsc");
                    break;
                  case "7":
                    await controlAllLights(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, configVars.defaultBrightness, "on", "vscEnding");
                    break;
                }
            }
          }
        }
      }
    }
  }
}