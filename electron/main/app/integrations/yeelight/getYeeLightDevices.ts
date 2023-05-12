import { configVars } from "../../../config/config";

export default async function getYeeLightDevices(){
  return configVars.yeeLightDevices;
}