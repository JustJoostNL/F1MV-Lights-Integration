import DiscordRPC from "discord-rpc";
import log from "electron-log";
import { liveTimingState } from "../../../multiviewer/api";
import { globalConfig } from "../../../ipc/config";
import { trackStatusToString } from "../../trackStatusToString";
import { integrationStates } from "../states";

const clientId = "1104476733865996439";

async function setActivity(rpc: any) {
  if (!rpc) return;

  const currentDate = Date.now();

  await rpc.setActivity({
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

export async function registerDiscordRPC() {
  const rpc = new DiscordRPC.Client({ transport: "ipc" });
  await DiscordRPC.register(clientId);

  rpc.on("ready", async () => {
    if (globalConfig.discordRPCEnabled && integrationStates.multiviewer) {
      await setActivity(rpc);
    }

    setInterval(async () => {
      if (globalConfig.discordRPCEnabled && integrationStates.multiviewer) {
        await setActivity(rpc);
      } else {
        await rpc.clearActivity();
      }
    }, 15000);
  });

  rpc.login({ clientId }).catch((error: any) => {
    log.error(
      "An error occurred while initializing the Discord integration, are you sure Discord is running?",
    );
    log.error("Discord error: " + error.message);
  });
}
