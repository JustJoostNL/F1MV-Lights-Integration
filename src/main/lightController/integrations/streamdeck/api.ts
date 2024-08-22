import { listStreamDecks, openStreamDeck } from "@elgato-stream-deck/node";
import log from "electron-log";
import { integrationStates } from "../states";
import { ControlType } from "../../controlAllLights";

export async function streamdeckInitialize() {
  try {
    const streamdeckList = await listStreamDecks();
    streamdeckList.forEach(async (deck) => {
      try {
        const instance = await openStreamDeck(deck.path);
        instance.clearPanel();
        integrationStates.streamdeck = true;
        instance.on("error", (err) => {
          integrationStates.streamdeck = false;
          log.error(
            "An error occurred while initializing the Stream Deck integration: " +
              err,
          );
        });
      } catch (err) {
        integrationStates.streamdeck = false;
        log.error(
          "An error occurred while initializing the Stream Deck integration: " +
            err,
        );
      }
    });
  } catch (err) {
    integrationStates.streamdeck = false;
    log.error(
      "An error occurred while initializing the Stream Deck integration: " +
        err,
    );
  }
}

interface StreamDeckControlArgs {
  controlType: ControlType;
  color: {
    r: number;
    g: number;
    b: number;
  };
  brightness: number;
}

export async function streamdeckControl({
  controlType,
  color,
  brightness,
}: StreamDeckControlArgs) {
  const streamdeckList = await listStreamDecks();
  streamdeckList.forEach(async (deck) => {
    const instance = await openStreamDeck(deck.path);

    switch (controlType) {
      case ControlType.On:
        log.debug("Turning all the available keys on the Stream Deck on...");
        for (let i = 0; i < instance.NUM_KEYS; i++) {
          instance.setBrightness(brightness);
          instance.fillKeyColor(i, color.r, color.g, color.b);
        }
        break;
      case ControlType.Off:
        log.debug("Turning all the available keys on the Stream Deck off...");
        for (let i = 0; i < instance.NUM_KEYS; i++) {
          instance.fillKeyColor(i, 0, 0, 0);
        }
        break;
    }
  });
}
