import { configVars } from "../../../config/config";
import { hueVars } from "../../vars/vars";

export default async function hueGetEntertainmentZones(){
  const authHueAPI = hueVars.authHueAPI;
  let hueData = {};
  const entertainmentZoneList = [];
  const hueEntertainmentZones = await authHueAPI.groups.getAll();
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