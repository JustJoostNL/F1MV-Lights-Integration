import createF1MVURLs from "./f1mv/createF1MVURLs";
import {analyticsHandler} from "./analytics/analytics";
import startF1MVLightSync from "./f1mv/F1MVLightSync";

export default async function initApp(){
	await createF1MVURLs();
	await analyticsHandler("getUniqueID");
	await analyticsHandler("activeUsersInit");
	await startF1MVLightSync();

	console.log("App initialized");
}