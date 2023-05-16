import { IConfig } from "../../types/DefaultConfigInterface";

const config: IConfig = {
  Settings:
        {
        	generalSettings:
                {
                	// automatically turn off the lights when the session has ended
                	autoTurnOffLights: true,
                	// the default brightness of the lights
                	defaultBrightness: 100,

                	goBackToStatic: true,
                	goBackToStaticEnabledFlags: [
                		"green",
                	],
                	goBackToStaticDelay: 10,
                	staticBrightness: 70,

                	hideLogs: true,

                	// here you can define other colors then the default ones
                	colorSettings:
                        {
                        	staticColor: {
                        		r: 255,
                        		g: 255,
                        		b: 255
                        	},

                        	green: {
                        		r: 0,
                        		g: 255,
                        		b: 0
                        	},
                        	yellow: {
                        		r: 255,
                        		g: 150,
                        		b: 0
                        	},
                        	red: {
                        		r: 255,
                        		g: 0,
                        		b: 0
                        	},
                        	safetyCar: {
                        		r: 255,
                        		g: 150,
                        		b: 0
                        	},
                        	vsc: {
                        		r: 255,
                        		g: 150,
                        		b: 0
                        	},
                        	vscEnding: {
                        		r: 255,
                        		g: 150,
                        		b: 0

                        	}
                        },
                	effectSettings: [
                		{
                			name: "VSC Ending Blink Effect",
                      id: 0,
                			trigger: "vscEnding",
                			enabled: true,
                			actions: [
                				{
                					type: "on",
                					color: {
                						r: 0,
                						g: 255,
                						b: 0
                					},
                					brightness: 100,
                				},
                				{
                					type: "delay",
                					delay: 500,
                				},
                				{
                					type: "on",
                					color: {
                						r: 255,
                						g: 150,
                						b: 0
                					},
                					brightness: 100,
                				},
                				{
                					type: "delay",
                					delay: 500,
                				}
                			],
                			amount: 5
                		}
                	]
                },

        	MultiViewerForF1Settings:
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
                	// set this to true if you don't want to use IKEA lights
                	ikeaDisable: true,
                	// Here you need to fill in the security code from your IKEA Tradfri gateway, you can find it on the bottom of the gateway.
                	securityCode: "",
                	// you don't need to change this
                	identity: undefined,
                	// you don't need to change this
                	psk: undefined,
                	// You can get these values by clicking "Settings" in the app and then click "Get Device IDs"
                	deviceIDs: [],
                },

        	goveeSettings:
                {
                	// set this to true if you don't want to use Govee lights
                	goveeDisable: true,
                },

        	openRGBSettings:
                {
                	// set this to true if you don't want to use OpenRGB
                	openRGBDisable: true,
                	// the IP address of your OpenRGB server
                	openRGBServerIP: "localhost",
                	// the port of your OpenRGB server
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
                	// set this to true if you don't want to use WLED lights
                	WLEDDisable: true,
                	devices: []
                },

        	streamDeckSettings:
                {
                	// set this to true if you don't want to use Stream Deck
                	streamDeckDisable: true,
                },

        	discordSettings:
                {
                	// set this to true if you don't want to use Discord RPC
                	discordRPCDisable: false,
                  avoidSpoilers: true,
                },

        	webServerSettings:
                {
                	// set this to true if you don't want to use the web server
                	webServerDisable: true,
                	// the port of the web server
                	webServerPort: 20202,
                },

        	advancedSettings:
                {
                	// Only set this to true if you want to see the debug messages in the console.
                	debugMode: false,
                	// update channel, you can choose between "latest", "beta" and "alpha"
                	updateChannel: "latest",

                	//analytics
                  //when enabled, you help us improve the app by sending anonymous usage data. Please consider keeping this enabled. Personal data is never collected!
                	analytics: true,
                }
        },
  // do not change this version!
  version: "2.0.0",
};

export default config;