import { IConfig } from "../../types/DefaultConfigInterface";

const config: IConfig = {
  Settings:
        {
        	generalSettings:
						{
						  autoTurnOffLights: true,
						  defaultBrightness: 100,

						  goBackToStatic: true,
						  goBackToStaticEnabledFlags:
								[
								  "green",
								],
						  goBackToStaticDelay: 10,
						  staticBrightness: 70,

						  hideLogs: true,

						  colorSettings:
								{
								  staticColor:
										{
										  r: 255,
										  g: 255,
										  b: 255
										},

								  green:
										{
										  r: 0,
										  g: 255,
										  b: 0
										},
								  yellow:
										{
										  r: 255,
										  g: 150,
										  b: 0
										},
								  red:
										{
										  r: 255,
										  g: 0,
										  b: 0
										},
								  safetyCar:
										{
										  r: 255,
										  g: 150,
										  b: 0
										},
								  vsc:
										{
										  r: 255,
										  g: 150,
										  b: 0
										},
								  vscEnding:
										{
										  r: 255,
										  g: 150,
										  b: 0
										}
								},
						  effectSettings: [
						    {
						      name: "Fastest Lap",
						      id: 0,
						      trigger: "fastestLap",
						      enabled: true,
						      actions: [
						        {
						          type: "on",
						          color:
												{
												  r: 91,
												  g: 0,
												  b: 166
												},
						          brightness: 100,
						        },
						        {
						          type: "delay",
						          delay: 1000,
						        },
						        {
						          type: "go_back_to_current_status",
						        },
						      ],
						      amount: 1
						    }
						  ]
						},

        	MultiViewerSettings:
						{
						  liveTimingURL: "http://localhost:10101",
						  f1mvCheck: true,
						},

        	hueSettings:
						{
						  hueDisable: true,
						  hueBridgeIP: undefined,
						  deviceIDs: [],
						  entertainmentZoneIDs: [],
						  token: undefined,
						  hue3rdPartyCompatMode: false,
						  enableFade: false,
						  enableFadeWithEffects: false,
						},

        	ikeaSettings:
						{
						  ikeaDisable: true,
						  securityCode: "",
						  identity: undefined,
						  psk: undefined,
						  deviceIDs: [],
						},

        	goveeSettings:
						{
						  goveeDisable: true,
						},

        	openRGBSettings:
						{
						  openRGBDisable: true,
						  openRGBServerIP: "localhost",
						  openRGBServerPort: 6742,
						},

        	homeAssistantSettings:
						{
						  homeAssistantDisable: true,
						  host: "",
						  port: 8123,
						  token: "",
						  devices: []
						},

        	WLEDSettings:
						{
						  WLEDDisable: true,
						  devices: []
						},

          MQTTSettings:
						{
						  MQTTDisable: true,
						  host: "",
						  port: 1883,
						  username: "",
						  password: "",
						},

        	streamDeckSettings:
						{
						  streamDeckDisable: true,
						},

        	discordSettings:
						{
						  discordRPCDisable: false,
						  avoidSpoilers: true,
						},

        	webServerSettings:
						{
						  webServerDisable: true,
						  webServerPort: 20202,
						},

        	advancedSettings:
						{
						  debugMode: false,
						  updateChannel: "latest",
						  analytics: true,
						}
        },
  version: "2.2.0",
};

export default config;