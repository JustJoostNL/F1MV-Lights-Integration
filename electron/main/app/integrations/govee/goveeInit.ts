import Govee from 'govee-lan-control'
import {configVars} from "../../../config/config";
import {goveeVars} from "../../vars/vars";

export default async function goveeInitialize(){
    try {
        goveeVars.govee = new Govee();
        goveeVars.goveeInitialized = true;
    } catch (error) {
        goveeVars.goveeInitialized = false;
        console.log(error);
    }
    goveeVars.govee.on("ready", () => {
        console.log('Govee is ready!');
    });
    goveeVars.govee.on("deviceAdded", (device) => {
        console.log("Govee device found: " + device.model);
    });
}