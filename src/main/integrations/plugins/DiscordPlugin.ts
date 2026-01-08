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
const TRACK_STATUS_MAP: Record<string, string> = {
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
    this.log("debug", "Initializing Discord RPC...");

    if (!this.activityStartTime) this.activityStartTime = Date.now();

    this.rpc = new DiscordRPC.Client({ transport: "ipc" });
    DiscordRPC.register(CLIENT_ID);

    this.rpc.on("ready", async () => {
      this.log("info", "Discord RPC connected");
      if (this.shouldShowActivity()) await this.updateActivity();

      this.activityInterval = setInterval(async () => {
        if (this.shouldShowActivity()) {
          await this.updateActivity();
        } else {
          await this.rpc?.clearActivity();
        }
      }, 15000);
    });

    try {
      await this.rpc.login({ clientId: CLIENT_ID });
      this.setOnline(true);
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "Connection failed";
      this.log("warn", `Failed to connect to Discord: ${reason}`);
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

  private shouldShowActivity(): boolean {
    return (
      globalConfig.discordRPCEnabled &&
      integrationManager.getMiscState(MiscState.MULTIVIEWER)
    );
  }

  private async updateActivity(): Promise<void> {
    if (!this.rpc) return;

    const liveTimingState = multiViewerService.getLiveTimingState();
    const meetingName =
      liveTimingState?.SessionInfo?.Meeting?.Name || "Unknown";
    const sessionName = liveTimingState?.SessionInfo?.Name || "Unknown";

    let state: string;
    if (globalConfig.discordRPCAvoidSpoilers) {
      state = "F1MV Lights Integration is running.";
    } else {
      const trackStatus = liveTimingState?.TrackStatus?.Status;
      const statusText = trackStatus
        ? TRACK_STATUS_MAP[String(trackStatus)] || "Unknown status"
        : "Unknown status";
      state = `${statusText} - F1MVLI is running.`;
    }

    await this.rpc.setActivity({
      details: `${meetingName} - ${sessionName}`,
      state,
      startTimestamp: this.activityStartTime ?? undefined,
      largeImageKey: "multiviewer_logo",
      largeImageText: "MultiViewer Logo",
      instance: false,
      buttons: [
        { label: "Download MultiViewer", url: "https://muvi.gg/download" },
        {
          label: "Download F1MV Lights Integration",
          url: "https://github.com/JustJoostNL/F1MV-Lights-Integration/releases/latest",
        },
      ],
    });
  }
}

export const discordPlugin = new DiscordPlugin();
