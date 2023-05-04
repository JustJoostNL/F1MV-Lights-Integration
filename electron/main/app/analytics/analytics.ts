import { configVars } from "../../config/config";
import { analytics, apiURLs } from "../vars/vars";
import fetch from "node-fetch";

let res;
let activeUsersPostInterval;
export async function analyticsHandler(action){
  const headers = {
    "Content-Type": "application/json",
  };
  switch (action) {
    case "getUniqueID":
      res = await fetch(apiURLs.uniqueIdURL, {
        method: "GET",
        headers: headers,
      });
      const uniqueIdData = await res.json();
      const uniqueId = uniqueIdData.uniqueID;
      analytics.uniqueID = uniqueId;
      return uniqueId;
    case "activeUsersInit":
      activeUsersPostInterval = setInterval(async () => {
        await fetch(apiURLs.activeUsersPostURL, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            uniqueID: analytics.uniqueID,
            userActive: true
          }),
        });
      }, 15000);
      break;
    case "activeUsersClose":
      clearInterval(activeUsersPostInterval);
      await fetch(apiURLs.activeUsersPostURL, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          uniqueID: analytics.uniqueID,
          userActive: false
        }),
      });
      break;
    case "sendAnalytics":
      await sendAnalytics();
      break;
  }
}

async function sendAnalytics(){
  if (configVars.analyticsPreference){
    //await fetch(apiURLs.analyticsPostURL);
    // finish later
  }
}