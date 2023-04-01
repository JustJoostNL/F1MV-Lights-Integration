import createF1MVURLs from "./f1mv/createF1MVURLs";
import {analyticsHandler} from "./analytics/analytics";
import startF1MVLightSync from "./f1mv/F1MVLightSync";
import initAllIntegrations from "./integrations/initIntegration";

export default async function initApp(){
	await createF1MVURLs();
	await analyticsHandler("getUniqueID");
	await analyticsHandler("activeUsersInit");
	await initAllIntegrations();
	await startF1MVLightSync();

	console.log("App initialized");
}