import { integrationStates, streamDeckVars } from "../../vars/vars";
import { openStreamDeck } from "@elgato-stream-deck/node";
import log from "electron-log";

export default async function streamDeckInitialize(){
  try {
    streamDeckVars.theStreamDeck = openStreamDeck();
    streamDeckVars.theStreamDeck.clearPanel();
    integrationStates.streamDeckOnline = true;
    streamDeckVars.theStreamDeck.on("error", (error) => {
      integrationStates.streamDeckOnline = false;
      log.error("An error occurred while initializing the Stream Deck integration: " + error);
    });
  } catch (error) {
    integrationStates.streamDeckOnline = false;
    log.error("An error occurred while initializing the Stream Deck integration: " + error);
  }
  if (!integrationStates.streamDeckOnline) {
    return;
  }
  log.debug("Successfully initialized the Stream Deck integration.");
  streamDeckVars.streamDeckKeyCount = streamDeckVars.theStreamDeck.NUM_KEYS;
  log.debug("Successfully retrieved the amount of keys on the Stream Deck: " + streamDeckVars.streamDeckKeyCount);
}