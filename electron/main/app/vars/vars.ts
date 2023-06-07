// F1MV URLS
export const f1mvURLs = {
  liveTimingURL: "" as string,
  heartBeatURL: "" as string,
};
// statuses
export const statuses = {
  SState: "" as string,
  SInfo: null,
  TState: "" as string,
  TStateCheck: "" as string,
  SStateCheck: "" as string,
};

// integration states
export const integrationStates = {
  ikeaOnline: false as boolean,
  goveeOnline: false as boolean,
  hueOnline: false as boolean,
  openRGBOnline: false as boolean,
  homeAssistantOnline: false as boolean,
  streamDeckOnline: false as boolean,
  WLEDOnline: false as boolean,
  MQTTOnline: false as boolean,
  F1MVAPIOnline: false as boolean,
  F1LiveSession: false as boolean,
  updateAPIOnline: false as boolean,
  webServerOnline: false as boolean,
};

// API URLS
export const baseURL = "https://api.jstt.me/api/v2";
export const apiURLs = {
  APIURL: "https://api.jstt.me/api/v2",
  updateURL: `${baseURL}/github/repos/JustJoostNL/F1MV-Lights-Integration/releases`,
  uniqueIdURL: `${baseURL}/f1mvli/analytics/active-users/getUniqueID`,
  activeUsersPostURL: `${baseURL}/f1mvli/analytics/active-users/post`,
  analyticsPostURL: `${baseURL}/f1mvli/analytics/post`,
  liveSessionCheckURL: `${baseURL}/f1tv/live-session`,
};

// analytics
export const analytics = {
  uniqueID: "" as string,
};

// go back to static
export const goBackToStatic = {
  goBackToStaticTimeout: null as NodeJS.Timeout | null,
  goBackToStaticRuns: false as boolean,
};

// govee
export const goveeVars = {
  govee: null,
  goveeInitialized: false as boolean,
};

//openrgb
export const openRGBVars = {
  openRGBClient: null,
};

// webserver
export const webServerVars = {
  webServerIOSocket: null,
  webServerHTTPServer: null,
};

// streamdeck
export const streamDeckVars = {
  theStreamDeck: null,
  streamDeckKeyCount: null as number | null,
};

// ikea
export const ikeaVars = {
  bridgeDiscovered: false as boolean,
  allIkeaDevices: [],
  colorDevices: [] as number[],
  whiteDevices: [] as number[],
};

// hue
export const hueVars = {
  authHueAPI: null,
  hueClient: null,
  hueAppName: "F1MV-Lights-Integration" as string,
  hueDeviceName: "DeviceType" as string,
  hueCreatedUser: null,
};

// mqtt
export const MQTTVars = {
  client: null,
};
