import { configVars } from "../../config/config";
import { MultiViewerURLs } from "../vars/vars";

export default async function createMultiViewerURLs(){
  let f1mvRawURL = configVars.F1MVURL as string;
  if (!f1mvRawURL) return;
  if (f1mvRawURL.endsWith("/")){
    f1mvRawURL = f1mvRawURL.slice(0, -1);
  }
  if (f1mvRawURL === "http://localhost:10101"){
    f1mvRawURL = "http://127.0.0.1:10101";
  }
  MultiViewerURLs.liveTimingURL = f1mvRawURL + "/api/graphql";
  MultiViewerURLs.heartBeatURL = f1mvRawURL + "/api/v1/live-timing/Heartbeat";
}