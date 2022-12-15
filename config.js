const config = {
    Settings:
        {
            generalSettings:
                {
                    // automatically turn off the lights when the session has ended
                    autoTurnOffLights: true,
                    // the default brightness of the lights
                    defaultBrightness: 100,
                },

            MultiViewerForF1Settings:
                {
                  liveTimingURL: "http://localhost:10101/api/graphql",
                },

            ikeaSettings:
                {
                    // set this to true if you don't want to use IKEA lights
                    ikeaDisable: false,

                    // Here you need to fill in the security code from your IKEA Tradfri gateway, you can find it on the bottom of the gateway.
                    securityCode: "SECURITY_CODE_HERE",
                    // You can get these values by clicking "Settings" in the app and then click "Get Ikea Device IDs"
                    colorDevices: ["DEVICE_ID_HERE", "DEVICE_ID_HERE"],
                    whiteDevices: ["DEVICE_ID_HERE", "DEVICE_ID_HERE"]
                },

            goveeSettings:
                {
                    // set this to true if you don't want to use Govee lights
                    goveeDisable: false,
                    // here you can give IPS of the govee devices you DON'T want to use, if you want to use all devices, leave this empty!
                    devicesDisabledIPS: ["DEVICE_IPS_HERE"],
                },

            yeeLightSettings:
                {
                    // set this to true if you don't want to use Yeelight lights
                    yeeLightDisable: false,

                    // Put the IP address of your Yeelight device(s) here, if you have multiple, separate them with a comma (Eg: "IP_ADDRESS_HERE-1", "IP_ADDRESS_HERE-2").
                    deviceIPs: ["IP_ADDRESS_HERE"],
                },

            advancedSettings:
                {
                    // Only set this to true if you want to see the debug messages in the console.
                    debugMode: false,
                    // update channel, you can choose between "latest", "beta" and "alpha"
                    updateChannel: "latest",

                    //analytics
                    // if you want to help me improve this project, you can enable analytics
                    // this will send me some data about how many times the lights have been switched on and off, etc...
                    // this will not send any personal data
                    // if you want to disable this, set this to false

                    analytics: true,
                }
        },
        // do not change this version!
        version: 1,
    devConfig:
        {
            autoStartDevTools: false,
            f1mvCheck: true,
            tradfriDev: false,
        }
}
module.exports = config;