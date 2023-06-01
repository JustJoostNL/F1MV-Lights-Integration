import { configVars } from "../../config/config";
import { analytics, apiURLs } from "../vars/vars";
import fetch from "node-fetch";
import log from "electron-log";

let res;
let activeUsersPostInterval;
export async function analyticsHandler(action){
  const headers = {
    "Content-Type": "application/json",
  };
  switch (action) {
    case "getUniqueID":
      try {
        res = await fetch(apiURLs.uniqueIdURL, {
          method: "GET",
          headers: headers,
        });
      } catch (error) {
        log.error(`An error occurred while getting an unique user ID: ${error}`);
      }
      const uniqueIdData = await res.json();
      const uniqueId = uniqueIdData.uniqueID;
      analytics.uniqueID = uniqueId;
      return uniqueId;
    case "activeUsersInit":
      activeUsersPostInterval = setInterval(async () => {
        try {
          await fetch(apiURLs.activeUsersPostURL, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
              uniqueID: analytics.uniqueID,
              userActive: true
            }),
          });
        } catch (error) {
          log.error(`An error occurred while posting active user data: ${error}`);
        }
      }, 15000);
      break;
    case "activeUsersClose":
      clearInterval(activeUsersPostInterval);
      try {
        await fetch(apiURLs.activeUsersPostURL, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            uniqueID: analytics.uniqueID,
            userActive: false
          }),
        });
      } catch (error) {
        log.error(`An error occurred while posting active user data: ${error}`);
      }
      break;
    case "sendAnalytics":
      await sendAnalytics();
      break;
  }
}

async function sendAnalytics(){
  if (configVars.analyticsPreference){
    //await fetch(apiURLs.analyticsPostURL); (add try catch later)
    // finish later
  }
}