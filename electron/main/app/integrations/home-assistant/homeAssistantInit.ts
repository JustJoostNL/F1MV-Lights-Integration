import log from "electron-log";
import homeAssistantOnlineCheck from "./homeAssistantOnlineCheck";

export default async function homeAssistantInitialize(){
  log.debug("Checking if the Home Assistant API is online...");

  const status = await homeAssistantOnlineCheck();
  //@ts-ignore
  if (status === "online"){
    log.debug("Home Assistant API is online.");
  } else {
    log.error("Error: Could not connect to the Home Assistant API, please make sure that the hostname and port are correct!");
  }
}