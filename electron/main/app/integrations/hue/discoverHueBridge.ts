import {handleConfigSet} from "../../../config/config";

const hue = require("node-hue-api").discovery;

export default async function discoverHueBridge(discoverMode: "remote" | "local") {
  try {
    switch (discoverMode) {
      case "remote":
        const remoteBridges = await hue.nupnpSearch()
        if (remoteBridges.length === 0) {
          return {
            status: "error",
            errorCode: 100,
            message: "No Philips Hue bridge found on the network."
          }
        } else {
          await handleConfigSet(null, "Settings.hueSettings.hueBridgeIP", remoteBridges[0].ipaddress)
          return {
            status: "success",
            ip: remoteBridges[0].ipaddress
          }
        }
      case "local":
        const localBridges = await hue.mdnsSearch(5000)
        if (localBridges.length === 0) {
          return {
            status: "error",
            errorCode: 100,
            message: "No Philips Hue bridge found on the network."
          }
        } else {
          await handleConfigSet(null, "Settings.hueSettings.hueBridgeIP", localBridges[0].ipaddress)
          return {
            status: "success",
            ip: localBridges[0].ipaddress
          }
        }
    }
  } catch (err) {
    const error = err.message;
    const errorMessage = error.toString();

    if (errorMessage.includes("429")) {
      return {
        status: "error",
        errorCode: 429,
        message: `Error: ${err.message}. Please try again later.`,
      };
    } else if (errorMessage.includes("101")) {
      return {
        status: "error",
        errorCode: 101,
        message:
          "The link button on the Philips Hue bridge was not pressed. Please press the link button and try again!",
      };
    } else {
      return {
        status: "error",
        errorCode: null,
        message: `Unexpected error: ${err.message}`,
      };
    }
  }
}