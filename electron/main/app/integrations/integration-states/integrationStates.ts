import {configVars} from "../../../config/config";
import {goveeVars} from "../../vars/vars";
import {integrationStates} from "../../vars/vars";

export default async function handleIntegrationStates(){
    if (!configVars.goveeDisable && goveeVars.goveeInitialized){
        if (goveeVars.govee.devicesArray.length > 0){
            integrationStates.goveeOnline = true;
        }
    }
    if (!configVars.nanoLeafDisable){
        // todo
    }
    if (!configVars.WLEDDisable){
        // todo
    }
    if (!configVars.homeAssistantDisable){
        // todo
    }

    const states = [
        { name: "ikea", state: integrationStates.ikeaOnline },
        { name: "govee", state: integrationStates.goveeOnline },
        { name: "hue", state: integrationStates.hueOnline },
        { name: "openRGB", state: integrationStates.openRGBOnline },
        { name: "homeAssistant", state: integrationStates.homeAssistantOnline },
        { name: "yeelight", state: integrationStates.yeeLightOnline },
        { name: "streamDeck", state: integrationStates.streamDeckOnline },
        { name: "nanoLeaf", state: integrationStates.nanoLeafOnline },
        { name: "WLED", state: integrationStates.WLEDOnline },
        { name: "F1MV", state: integrationStates.F1MVAPIOnline },
        { name: "F1TVLiveSession", state: integrationStates.F1LiveSession },
        { name: "update", state: integrationStates.updateAPIOnline },
        { name: "webServer", state: integrationStates.webServerOnline }
    ]

    return states;
}