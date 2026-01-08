import { listStreamDecks, openStreamDeck } from "@elgato-stream-deck/node";
import { BaseIntegrationPlugin } from "../BaseIntegrationPlugin";
import {
  IntegrationPlugin,
  IntegrationControlArgs,
  ControlType,
} from "../../../shared/types/integration";

export class StreamDeckPlugin extends BaseIntegrationPlugin {
  readonly id = IntegrationPlugin.STREAMDECK;
  readonly name = "Stream Deck";
  readonly enabledConfigKey = "streamdeckEnabled";
  readonly restartConfigKeys = [];

  async initialize(): Promise<void> {
    try {
      const streamdeckList = await listStreamDecks();
      let failedCount = 0;

      const handleError = (error: unknown) => {
        failedCount++;
        this.log(
          "error",
          `Error initializing Stream Deck: ${error} - Please make sure the Stream Deck app is closed.`,
        );

        if (failedCount === streamdeckList.length) {
          this.setOnline(false);
        }
      };

      for (const deck of streamdeckList) {
        try {
          const instance = await openStreamDeck(deck.path);
          await instance.clearPanel();
          this.setOnline(true);
          instance.on("error", handleError);
        } catch (error) {
          handleError(error);
        }
      }

      if (streamdeckList.length === 0) {
        this.setOnline(false);
      }
    } catch (error) {
      this.setOnline(false);
      this.log(
        "error",
        `Error listing Stream Decks: ${error} - Please make sure the Stream Deck app is closed.`,
      );
    }
  }

  async control(args: IntegrationControlArgs): Promise<void> {
    const { controlType, color, brightness } = args;

    const streamdeckList = await listStreamDecks().catch((error) => {
      this.log(
        "error",
        `Error listing Stream Decks: ${error} - Please make sure the Stream Deck app is closed.`,
      );
      return [];
    });

    for (const deck of streamdeckList) {
      try {
        const instance = await openStreamDeck(deck.path);
        if (!instance) continue;

        const buttons = instance.CONTROLS.filter(
          (control) => control.type === "button",
        );

        switch (controlType) {
          case ControlType.ON:
            this.log("debug", "Turning all Stream Deck keys on...");
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

          case ControlType.OFF:
            this.log("debug", "Turning all Stream Deck keys off...");
            await instance.clearPanel();
            break;
        }
      } catch (error) {
        this.log("error", `Error controlling Stream Deck: ${error}`);
      }
    }
  }
}

export const streamdeckPlugin = new StreamDeckPlugin();
