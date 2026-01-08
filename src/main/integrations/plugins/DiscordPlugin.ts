import DiscordRPC from "discord-rpc";
import { BaseIntegrationPlugin } from "../BaseIntegrationPlugin";
import { globalConfig } from "../../ipc/config";
import { integrationManager } from "../IntegrationManager";
import {
  IntegrationPlugin,
  MiscState,
} from "../../../shared/types/integration";
import { multiViewerService } from "../../MultiViewerService";
import { IConfig } from "../../../shared/types/config";

const CLIENT_ID = "1104476733865996439";
const trackStatusMessageMap: Record<string, string> = {
  "1": "Green flag",
  "2": "Yellow flag",
  "4": "Safety car",
  "5": "Red flag",
  "6": "Virtual safety car",
  "7": "VSC Ending",
};

export class DiscordPlugin extends BaseIntegrationPlugin {
  readonly id = IntegrationPlugin.DISCORD;
  readonly name = "Discord RPC";
  readonly enabledConfigKey = "discordRPCEnabled";
  readonly restartConfigKeys: (keyof IConfig)[] = ["discordRPCAvoidSpoilers"];

  private rpc: DiscordRPC.Client | null = null;
  private activityInterval: ReturnType<typeof setInterval> | null = null;
  private activityStartTime: number | null = null;

  async initialize(): Promise<void> {
    if (!this.activityStartTime) {
      this.activityStartTime = Date.now();
    }

    this.rpc = new DiscordRPC.Client({ transport: "ipc" });
    await DiscordRPC.register(CLIENT_ID);

    this.rpc.on("ready", async () => {
      if (globalConfig.discordRPCEnabled && this.isMultiviewerOnline()) {
        await this.setActivity();
      }

      this.activityInterval = setInterval(async () => {
        if (globalConfig.discordRPCEnabled && this.isMultiviewerOnline()) {
          await this.setActivity();
        } else {
          await this.rpc?.clearActivity();
        }
      }, 15000);
    });

    try {
      await this.rpc.login({ clientId: CLIENT_ID });
      this.setOnline(true);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.log(
        "error",
        `Error initializing Discord integration, is Discord running? Error: ${errorMessage}`,
      );
      this.setOnline(false);
    }
  }

  async shutdown(): Promise<void> {
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
      this.activityInterval = null;
    }
    this.activityStartTime = null;

    if (this.rpc) {
      await this.rpc.clearActivity();
      this.rpc.destroy();
      this.rpc = null;
    }

    await super.shutdown();
  }

  private async setActivity(): Promise<void> {
    if (!this.rpc) return;

    const liveTimingState = multiViewerService.getLiveTimingState();

    await this.rpc.setActivity({
      details:
        (liveTimingState?.SessionInfo?.Meeting?.Name || "Unknown") +
        " - " +
        (liveTimingState?.SessionInfo?.Name || "Unknown"),
      state: globalConfig.discordRPCAvoidSpoilers
        ? "F1MV Lights Integration is running."
        : (liveTimingState?.TrackStatus?.Status
            ? trackStatusMessageMap[
                String(liveTimingState.TrackStatus.Status)
              ] || "Unknown status"
            : "Unknown status") + " - F1MVLI is running.",
      startTimestamp: this.activityStartTime ?? undefined,
      largeImageKey: "multiviewer_logo",
      largeImageText: "MultiViewer Logo",
      instance: false,
      buttons: [
        {
          label: "Download MultiViewer",
          url: "https://muvi.gg/download",
        },
        {
          label: "Download F1MV Lights Integration",
          url: "https://github.com/JustJoostNL/F1MV-Lights-Integration/releases/latest",
        },
      ],
    });
  }

  private isMultiviewerOnline(): boolean {
    return integrationManager.getMiscState(MiscState.MULTIVIEWER) ?? false;
  }
}

export const discordPlugin = new DiscordPlugin();
