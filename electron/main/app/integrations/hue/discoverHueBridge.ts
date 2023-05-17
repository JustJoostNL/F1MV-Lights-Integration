import { handleConfigSet } from "../../../config/config";
import hueInitialize from "./hueInit";

const hue = require("node-hue-api").discovery;

export default async function discoverHueBridge(discoverMode: "remote" | "local") {
  try {
    switch (discoverMode) {
      case "remote":
        const remoteBridges = await hue.nupnpSearch();
        if (remoteBridges.length === 0) {
          return {
            status: "error",
            errorCode: 100,
            message: "No Philips Hue bridge found on the network."
          };
        } else {
          await handleConfigSet(null, "Settings.hueSettings.hueBridgeIP", remoteBridges[0].ipaddress);
          return {
            status: "success",
            ip: remoteBridges[0].ipaddress
          };
        }
      case "local":
        const localBridges = await hue.mdnsSearch(5000);
        if (localBridges.length === 0) {
          return {
            status: "error",
            errorCode: 100,
            message: "No Philips Hue bridge found on the network."
          };
        } else {
          await handleConfigSet(null, "Settings.hueSettings.hueBridgeIP", localBridges[0].ipaddress);
          return {
            status: "success",
            ip: localBridges[0].ipaddress
          };
        }
    }
  } catch (err) {
    return {
      status: "error",
      errorCode: null,
      message: `Unexpected error: ${err.message}`,
    };
  }
}