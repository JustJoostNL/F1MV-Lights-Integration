import {configVars} from "../../config/config";
import {f1mvURLs} from "../vars/vars";
import {statuses} from "../vars/vars";
export async function F1MVAPICall(){
	if (configVars.f1mvSync){
		let errorCheck: boolean;
		try {
			const response = await fetch(f1mvURLs.liveTimingURL, {
				method: "POST",
				headers: {
					"content-type": "application/json"
				},
				body: JSON.stringify({
					"query": "query {\n  liveTimingState {\n    SessionStatus\n SessionInfo\n TrackStatus\n  }\n}"
				})
			});
			if (response.status === 200) {
				errorCheck = false;
				const responseData = await response.json();
				statuses.SState = responseData.data.liveTimingState.SessionStatus.Status;
				statuses.SInfo = responseData.data.liveTimingState.SessionInfo;
				statuses.TState = responseData.data.liveTimingState.TrackStatus.Status;
			}
		} catch (e) {
			if (errorCheck !== true) {
				errorCheck = true;
				console.log("F1MV API call failed");
			}
		}
	}
}