import { configVars } from "../../../config/config";
import { hueVars } from "../../vars/vars";
import log from "electron-log";

export default async function hueGetEntertainmentZones(){
  const authHueAPI = hueVars.authHueAPI;
  let hueData = {};
  let hueEntertainmentZones = [];
  const entertainmentZoneList = [];
  try {
    hueEntertainmentZones = await authHueAPI.groups.getAll();
  } catch (e) {
    log.error(`An error occurred while getting the Hue entertainment zones: ${e}`);
  }
  if (!hueEntertainmentZones){
    return;
  }
  const alreadySelectedZones = configVars.hueDevices;

  for (const zone of hueEntertainmentZones){
    const name = zone.name;
    const id = zone.id;
    const state = zone.state.all_on;
    entertainmentZoneList.push({ name: name, id: id, state: state });
  }

  hueData = {
    zones: entertainmentZoneList,
    alreadySelectedZones: alreadySelectedZones,
  };
  return hueData;
}