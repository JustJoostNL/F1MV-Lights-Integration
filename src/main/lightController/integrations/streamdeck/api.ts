import { listStreamDecks, openStreamDeck } from "@elgato-stream-deck/node";
import log from "electron-log";
import { integrationStates } from "../states";
import { ControlType } from "../../controlAllLights";

export async function streamdeckInitialize() {
  try {
    const streamdeckList = await listStreamDecks();
    let failedCount = 0;

    const handleError = (error: unknown) => {
      failedCount++;
      log.error(
        `An error occurred while trying to initialize the Stream Deck integration: ${error} - Please make sure the Stream Deck app is closed.`,
      );

      if (failedCount === streamdeckList.length) {
        console.log("all failed, setting to false");
        integrationStates.streamdeck = false;
      }
    };

    for (const deck of streamdeckList) {
      try {
        const instance = await openStreamDeck(deck.path);

        await instance.clearPanel();
        integrationStates.streamdeck = true;

        instance.on("error", handleError);
      } catch (error) {
        handleError(error);
      }
    }

    if (streamdeckList.length === 0) {
      integrationStates.streamdeck = false;
    }
  } catch (error) {
    integrationStates.streamdeck = false;
    log.error(
      `An error occurred while trying to list the Stream Decks: ${error} - Please make sure the Stream Deck app is closed.`,
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
  const streamdeckList = await listStreamDecks().catch((error) => {
    log.error(
      `An error occurred while trying to list the Stream Decks: ${error} - Please make sure the Stream Deck app is closed.`,
    );
    return [];
  });

  for (const deck of streamdeckList) {
    try {
      const instance = await openStreamDeck(deck.path);
      if (!instance) return;

      const buttons = instance.CONTROLS.filter(
        (control) => control.type === "button",
      );

      switch (controlType) {
        case ControlType.On:
          log.debug("Turning all the available keys on the Stream Deck on...");
          for (const button of buttons) {
            await instance.setBrightness(brightness);
            await instance.fillKeyColor(
              button.index,
              color.r,
              color.g,
              color.b,
            );
          }
          break;
        case ControlType.Off:
          log.debug("Turning all the available keys on the Stream Deck off...");
          await instance.clearPanel();
          break;
      }
    } catch (error) {
      log.error(
        `An error occurred while trying to control the Stream Deck: ${error}`,
      );
    }
  }
}
