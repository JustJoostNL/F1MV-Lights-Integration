// F1MV URLS
export const f1mvURLs = {
  liveTimingURL: "",
  heartBeatURL: "",
};
// statuses
export const statuses = {
  SState: "",
  SInfo: "",
  TState: "",
  TStateCheck: "",
  SStateCheck: "",
};

// integration states
export const integrationStates = {
  ikeaOnline: false,
  goveeOnline: false,
  hueOnline: false,
  openRGBOnline: false,
  homeAssistantOnline: false,
  yeeLightOnline: false,
  streamDeckOnline: false,
  nanoLeafOnline: false,
  WLEDOnline: false,
  F1MVAPIOnline: false,
  F1LiveSession: false,
  updateAPIOnline: false,
  webServerOnline: false,
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
  uniqueID: "",
};

// go back to static
export const goBackToStatic = {
  goBackToStaticTimeout: null,
  goBackToStaticRuns: false,
};

// govee
export const goveeVars = {
  govee: null,
  goveeInitialized: false,
};