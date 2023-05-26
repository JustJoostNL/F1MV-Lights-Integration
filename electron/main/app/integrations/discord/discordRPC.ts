import DiscordRPC from "discord-rpc";
import { integrationStates, statuses } from "../../vars/vars";
import { configVars } from "../../../config/config";
import log from "electron-log";
import trackStatusToString from "../../utils/trackStatusToString";

export default async function discordRPC(){
  const clientId = "1104476733865996439";
  const RPC = new DiscordRPC.Client({ transport: "ipc" });

  await DiscordRPC.register(clientId);
  const currentDate = Date.now();

  async function setActivity() {
    if (!statuses.SInfo) {
      statuses.SInfo = {
        Name: "peanuts",
        Meeting: {
          Name: "peanuts",
        }
      };
    }
    if (!statuses.TState) {
      statuses.TState = "peanuts";
    }

    if (!RPC) return;

    await RPC.setActivity({
      details: statuses.SInfo.Meeting.Name + " - " + statuses.SInfo.Name,
      state: configVars.discordRPCAvoidSpoilers ? "F1MV Lights Integration is running." : await trackStatusToString(statuses.TState) + " - F1MVLI is running.",
      startTimestamp: currentDate,
      largeImageKey: "multiviewer_logo",
      largeImageText: "MultiViewer Logo",
      instance: false,
      buttons: [
        {
          label: "Download MultiViewer",
          url: "https://multiviewer.app/download"
        },
        {
          label: "Download F1MV Lights Integration",
          url: "https://github.com/JustJoostNL/F1MV-Lights-Integration/releases/latest"
        }
      ],
    });
  }
  RPC.on("ready", async () => {
    if (!configVars.discordRPCDisable && integrationStates.F1MVAPIOnline) {
      await setActivity();
    }
    setInterval(async () => {
      if (!configVars.discordRPCDisable && integrationStates.F1MVAPIOnline) {
        await setActivity();
      } else {
        await RPC.clearActivity();
      }
    }, 15000);
  });

  RPC.login({ clientId }).catch((e) => {
    log.error("An error occurred while initializing the Discord integration, are you sure Discord is running?");
    log.error("Discord error: " + e.message);
  });
}