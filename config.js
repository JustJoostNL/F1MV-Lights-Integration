const config = {
    Settings:
        {

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

                    // Please do not change the "Identity" and "Psk" values, this will be filled in automatically after the first run (when everything is set up correctly).
                    Identity: "IDENTITY_COMES_HERE",
                    Psk: "PSK_COMES_HERE",
                },

            goveeSettings:
                {
                    // set this to true if you don't want to use Govee lights
                    goveeDisable: false,

                    // Here you need to fill in the API key from your Govee account, you can find it in the Govee app under "Account" -> "API Key".
                    apiKey: "API_KEY_HERE",

                    // Here you need to fill in your device MAC address from your Govee device(s), if you have multiple, separate them with a comma (Eg: "DEVICE_MAC_HERE-1", "DEVICE_MAC_HERE-2").
                    // Also make sure if you have multiple devices, that the deviceMac and deviceModel are in the same order.
                    deviceMac: ["DEVICE_MACS_HERE"],

                    // Here you need to fill in the device model type from your Govee device(s), if you have multiple, separate them with a comma (Eg: "DEVICE_MODEL_HERE-1", "DEVICE_MODEL_HERE-2").
                    // Also make sure if you have multiple devices, that the deviceMac and deviceModel are in the same order.
                    deviceModel: ["DEVICE_MODELS_HERE"],

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
        // automatically turn off the lights when the session has ended
        autoTurnOffLights: true,
        // do not change this version!
        version: 1
}
module.exports = config;