import { configVars } from "../../../config/config";

export default async function getWLEDDevices(){
  return configVars.WLEDDevices;
}