import { ikeaVars } from "../../vars/vars";
import { configVars } from "../../../config/config";

export default async function ikeaGetDevices(){
  let ikeaData = {};
  const deviceList = [];
  for (const deviceId in ikeaVars.allIkeaDevices) {
    const device = ikeaVars.allIkeaDevices[deviceId];
    if (device.type !== 2){
      continue;
    }
    const name = device.name;
    const id = device.instanceId;
    const state = device.lightList[0].onOff;
    const spectrum = device.lightList[0].spectrum;
    deviceList.push({ name: name, id: id, state: state, spectrum: spectrum });
  }
  const alreadySelectedIkeaDevices = configVars.ikeaDevices;
  ikeaData = {
    devices: deviceList,
    alreadySelectedDevices: alreadySelectedIkeaDevices,
  };
  return ikeaData;
}