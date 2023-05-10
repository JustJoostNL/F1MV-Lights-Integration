import {ColorTranslator} from "colortranslator";

export default async function getHueSatFromRGB(r, g, b){
  const color = new ColorTranslator("rgb(" + r + "," + g + "," + b + ")");
  const hueValue = color.H;
  const satValue = color.S;
  return {
    hue: hueValue,
    sat: satValue
  };
}