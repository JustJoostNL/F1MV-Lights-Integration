import Store from "electron-store";
import defaultConfig from "./defaultConfig";

const userConfig = new Store({
	name: "Settings",
	defaults: defaultConfig
});
export default userConfig;