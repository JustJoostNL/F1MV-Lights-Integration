import { configVars } from "../../config/config";
import { MultiViewerURLs } from "../vars/vars";
import { statuses } from "../vars/vars";
import fetch from "node-fetch";
import log from "electron-log";

let errorCheck = false;

export async function MultiViewerAPICall(){
  if (configVars.f1mvSync){
    try {
      const response = await fetch(MultiViewerURLs.liveTimingURL, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          "query": "query {\n  liveTimingState {\n    SessionStatus\n SessionInfo\n TrackStatus\n TimingStats\n TimingData\n  }\n}"
        })
      });
      if (response.status === 200) {
        errorCheck = false;
        const responseData = await response.json();
        if (!responseData.data.liveTimingState) return;
        statuses.SState = responseData.data.liveTimingState.SessionStatus.Status;
        statuses.SInfo = responseData.data.liveTimingState.SessionInfo;
        statuses.TState = responseData.data.liveTimingState.TrackStatus.Status;
        statuses.TStats = responseData.data.liveTimingState.TimingStats.Lines;
        statuses.TData = responseData.data.liveTimingState.TimingData.Lines;
      }
    } catch (e) {
      if (!errorCheck) {
        errorCheck = true;
        log.warn("MultiViewer API call failed! Error: " + e.message);
      }
    }
  }
}