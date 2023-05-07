import { integrationStates, streamDeckVars } from "../../vars/vars";
import log from "electron-log";

export default async function streamDeckControl(r, g, b, brightness, action){
  if (!integrationStates.streamDeckOnline){
    return;
  }
  switch (action) {
    case "on":
      log.debug("Turning all the available keys on the Stream Deck on...");
      for (let i = 0; i < streamDeckVars.streamDeckKeyCount; i++) {
        streamDeckVars.theStreamDeck.fillKeyColor(i, r, g, b);
      }
      streamDeckVars.theStreamDeck.setBrightness(brightness);
      break;
    case "off":
      log.debug("Turning all the available keys on the Stream Deck off...");
      for (let i = 0; i < streamDeckVars.streamDeckKeyCount; i++) {
        streamDeckVars.theStreamDeck.fillKeyColor(i, 0, 0, 0);
      }
      break;
  }
}