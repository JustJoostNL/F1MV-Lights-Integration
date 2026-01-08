import { listStreamDecks, openStreamDeck } from "@elgato-stream-deck/node";
import { BaseIntegrationPlugin } from "../BaseIntegrationPlugin";
import { IntegrationApiError } from "../utils/error";
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
    this.log("debug", "Initializing Stream Deck...");

    const streamdeckList = await listStreamDecks();
    if (streamdeckList.length === 0) {
      throw new IntegrationApiError("No Stream Deck devices found");
    }

    let successCount = 0;
    for (const deck of streamdeckList) {
      try {
        const instance = await openStreamDeck(deck.path);
        await instance.clearPanel();
        successCount++;
        instance.on("error", () => {}); // Ignore errors after init
      } catch (error) {
        const reason = error instanceof Error ? error.message : "Unknown error";
        this.log(
          "warn",
          `Failed to initialize Stream Deck at ${deck.path}: ${reason}`,
        );
      }
    }

    if (successCount === 0) {
      throw new IntegrationApiError(
        "Failed to initialize any Stream Deck devices. Make sure the Stream Deck app is closed.",
      );
    }

    this.setOnline(true);
    this.log(
      "info",
      `Initialized ${successCount}/${streamdeckList.length} Stream Deck devices`,
    );
  }

  async control(args: IntegrationControlArgs): Promise<void> {
    if (!this._isOnline) return;

    const { controlType, color, brightness } = args;
    const streamdeckList = await listStreamDecks();

    for (const deck of streamdeckList) {
      const instance = await openStreamDeck(deck.path);
      if (!instance) continue;

      const buttons = instance.CONTROLS.filter(
        (control) => control.type === "button",
      );

      if (controlType === ControlType.ON) {
        await instance.setBrightness(brightness);
        for (const button of buttons) {
          await instance.fillKeyColor(button.index, color.r, color.g, color.b);
        }
      } else {
        await instance.clearPanel();
      }
    }
  }
}

export const streamdeckPlugin = new StreamDeckPlugin();
