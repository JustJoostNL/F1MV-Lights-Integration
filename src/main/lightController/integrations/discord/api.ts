import DiscordRPC from "discord-rpc";
import log from "electron-log";
import { liveTimingState } from "../../../multiviewer/api";
import { globalConfig } from "../../../ipc/config";
import { trackStatusToString } from "../../trackStatusToString";
import { integrationStates } from "../states";

export async function registerDiscordRPC() {
  const clientId = "1104476733865996439";
  const RPC = new DiscordRPC.Client({ transport: "ipc" });

  await DiscordRPC.register(clientId);
  const currentDate = Date.now();

  async function setActivity() {
    if (!RPC) return;

    await RPC.setActivity({
      details:
        liveTimingState?.SessionInfo.Meeting.Name +
        " - " +
        liveTimingState?.SessionInfo.Name,
      state: globalConfig.discordRPCAvoidSpoilers
        ? "F1MV Lights Integration is running."
        : trackStatusToString(liveTimingState?.TrackStatus.Status) +
          " - F1MVLI is running.",
      startTimestamp: currentDate,
      largeImageKey: "multiviewer_logo",
      largeImageText: "MultiViewer Logo",
      instance: false,
      buttons: [
        {
          label: "Download MultiViewer",
          url: "https://multiviewer.app/download",
        },
        {
          label: "Download F1MV Lights Integration",
          url: "https://github.com/JustJoostNL/F1MV-Lights-Integration/releases/latest",
        },
      ],
    });
  }
  RPC.on("ready", async () => {
    if (globalConfig.discordRPCEnabled && integrationStates.multiviewer) {
      await setActivity();
    }
    setInterval(async () => {
      if (globalConfig.discordRPCEnabled && integrationStates.multiviewer) {
        await setActivity();
      } else {
        await RPC.clearActivity();
      }
    }, 15000);
  });

  RPC.login({ clientId }).catch((e) => {
    log.error(
      "An error occurred while initializing the Discord integration, are you sure Discord is running?",
    );
    log.error("Discord error: " + e.message);
  });
}
