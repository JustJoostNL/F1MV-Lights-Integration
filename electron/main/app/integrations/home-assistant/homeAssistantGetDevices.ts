import {configVars} from "../../../config/config";
import {headers} from "./homeAssistantShared";
import {f1mvli} from "../../../../preload";

export default async function homeAssistantGetDevices(){
  const url = "http://" + configVars.homeAssistantHost + ":" + configVars.homeAssistantPort + "/api/states";

  let stateData;
  const response = await fetch(url, {
    method: "GET",
    headers: headers
  }).then((res) => res.json()).then((data) => {
    stateData = data;
  });

  let deviceInformation = [];
  let allInformation = {}
  for (const item of stateData) {
    if (item.entity_id.startsWith("light.")){
      const name = item.attributes.friendly_name;
      const id = item.entity_id;
      const state = item.state;
      deviceInformation.push({name: name, id: id, state: state});
    }
  }
  const alreadySelectedDevices = configVars.homeAssistantDevices;
  allInformation = {deviceInformation: deviceInformation, alreadySelectedDevices: alreadySelectedDevices};
  await f1mvli.utils.openNewWindow("/select-hass-devices")

}