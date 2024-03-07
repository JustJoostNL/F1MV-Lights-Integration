import { ColorTranslator } from "colortranslator";
import log from "electron-log";

export function rgbToHueSat(r: number, g: number, b: number) {
  const color = new ColorTranslator("rgb(" + r + "," + g + "," + b + ")");
  const hueValue = color.H;
  const satValue = color.S;
  log.debug(
    `Converted RGB(${r}, ${g}, ${b}) to H(${hueValue}) and S(${satValue})`,
  );
  return {
    hue: hueValue,
    sat: satValue,
  };
}
