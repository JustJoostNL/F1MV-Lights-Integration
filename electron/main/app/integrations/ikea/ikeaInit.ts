import log from "electron-log";
import discoverIkeaBridge from "./discoverIkeaBridge";

export default async function ikeaInitialize(){
  log.debug("Initializing IKEA Tradfri...");
  await discoverIkeaBridge();
}