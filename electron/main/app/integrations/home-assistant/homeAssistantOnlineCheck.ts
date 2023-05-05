import {configVars} from "../../../config/config";
import {integrationStates} from "../../vars/vars";
import {headers} from "./homeAssistantShared";

export default async function homeAssistantOnlineCheck(){
  const options = {
    method: 'GET',
    headers: headers,
  }

  const url = "http://" + configVars.homeAssistantHost + ":" + configVars.homeAssistantPort + "/api/";
  await fetch(url, options).then((res) => res.json()).then((data) => {
    if (data.message === "API running."){
      integrationStates.homeAssistantOnline = true;
      return "online";
    } else {
      integrationStates.homeAssistantOnline = false;
      return "offline";
    }
  });
}