import { configVars } from "../../../config/config";
import { integrationStates } from "../../vars/vars";
import fetch from "node-fetch";

export default async function homeAssistantOnlineCheck(){
  const headers = {
    "Authorization": "Bearer " + configVars.homeAssistantToken,
    "Content-Type": "application/json"
  };
  const options = {
    method: "GET",
    headers: headers,
  };

  const url = configVars.homeAssistantHost + ":" + configVars.homeAssistantPort + "/api/";
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    if (data.message === "API running."){
      integrationStates.homeAssistantOnline = true;
      return "online";
    } else {
      integrationStates.homeAssistantOnline = false;
      return "offline";
    }
  } catch (error) {
    integrationStates.homeAssistantOnline = false;
    return "offline";
  }
}