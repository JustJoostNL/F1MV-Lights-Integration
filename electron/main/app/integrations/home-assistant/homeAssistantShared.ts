import {configVars} from "../../../config/config";

export const headers = {
  "Authorization": "Bearer " + configVars.homeAssistantToken,
  "Content-Type": "application/json"
};