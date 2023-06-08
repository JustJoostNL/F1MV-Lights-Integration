import { configVars } from "../../../config/config";
import { hueVars } from "../../vars/vars";
import log from "electron-log";

export default async function hueGetDevices(){
  const authHueAPI = hueVars.authHueAPI;
  let hueData = {};
  let hueDevices = [];
  const deviceList = [];
  try {
    hueDevices = await authHueAPI.lights.getAll();
  } catch (e) {
    log.error(`An error occurred while getting the Hue devices: ${e}`);
  }
  if (!hueDevices){
    return;
  }
  const alreadySelectedDevices = configVars.hueDevices;

  for (const device of hueDevices){
    const name = device.name;
    const id = device.id;
    const state = device.state.on;
    deviceList.push({ name: name, id: id, state: state });
  }

  hueData = {
    devices: deviceList,
    alreadySelectedDevices: alreadySelectedDevices,
  };
  return hueData;
}