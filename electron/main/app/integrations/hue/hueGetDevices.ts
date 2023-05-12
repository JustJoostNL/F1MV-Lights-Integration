import { configVars } from "../../../config/config";
import { hueVars } from "../../vars/vars";

export default async function hueGetDevices(){
  const authHueAPI = hueVars.authHueAPI;
  let hueData = {};
  const deviceList = [];
  const hueDevices = await authHueAPI.lights.getAll();
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