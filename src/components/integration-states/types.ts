export type IntegrationState = {
  name: string;
  state: boolean;
  disabled: boolean;
}


export type IntegrationStatesMap = {
  ikea: string,
  govee: string,
  hue: string,
  openRGB: string,
  homeAssistant: string,
  streamDeck: string,
  WLED: string,
  F1MV: string,
  F1TVLiveSession: string,
  update: string,
  webServer: string,
}