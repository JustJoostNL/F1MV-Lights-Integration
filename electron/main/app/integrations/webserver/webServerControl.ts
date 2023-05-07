import { webServerVars } from "../../vars/vars";

export default async function webServerControl(r, g, b, brightness, action){
  webServerVars.webServerIOSocket.emit("color-change", {
    r,
    g,
    b,
    brightness,
    action
  });
}