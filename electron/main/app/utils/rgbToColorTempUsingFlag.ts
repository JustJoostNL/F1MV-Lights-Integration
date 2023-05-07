export default async function rgbToColorTempUsingFlag(flag){
  switch (flag) {
    case "green":
      return 1;
    case "red":
      return 454;
    case "yellow":
    case "safetyCar":
    case "vsc":
    case "vscEnding":
      return 370;
  }
}