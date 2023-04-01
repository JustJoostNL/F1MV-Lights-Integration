import createF1MVURLs from "./f1mv/createF1MVURLs";
import {analyticsHandler} from "./analytics/analytics";

export default async function initApp(){

	await createF1MVURLs();
	await analyticsHandler("getUniqueID");
	await analyticsHandler("activeUsersInit");


	console.log("App initialized");
}