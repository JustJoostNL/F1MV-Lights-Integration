import {configVars} from "../../config/config";
import {f1mvURLs} from "../vars/vars";

export default async function createF1MVURLs(){
	let f1mvRawURL: any = configVars.F1MVURL;
	if (f1mvRawURL.endsWith("/")){
		f1mvRawURL = f1mvRawURL.slice(0, -1);
	}
	if (f1mvRawURL === "http://localhost:10101"){
		f1mvRawURL = "http://127.0.0.1:10101";
	}
	f1mvURLs.liveTimingURL = f1mvRawURL + "/api/graphql";
	f1mvURLs.heartBeatURL = f1mvRawURL + "/api/v1/live-timing/Heartbeat";
}