import { ipcRenderer } from "electron";

export const f1mvli = {
	config: {
		set: (key: string, value) => ipcRenderer.invoke("config:set", key, value),
		get: (key: string) => ipcRenderer.invoke("config:get", key),
		getAll: () => ipcRenderer.invoke("config:get:all"),
		delete: (key: string) => ipcRenderer.invoke("config:delete", key),
	},
	updater: {
		checkForUpdate: () => ipcRenderer.invoke("updater:checkForUpdate"),
	},
};

// @ts-ignore
window.f1mvli = f1mvli;