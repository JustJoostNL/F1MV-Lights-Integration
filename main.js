'use strict';
let testBuild = false;
let testMode = false;
const {
    app,
    dialog,
    ipcMain
} = require('electron')
const BrowserWindow = require('electron').BrowserWindow
const electronLocalShortcut = require('electron-localshortcut');
const fs = require('fs');
const {
    autoUpdater
} = require("electron-updater")
const process = require('process');
const configDefault = require("./config");
const Store = require('electron-store');
const {
    Bulb
} = require("yeelight.io");
const userConfig = new Store({
    name: 'settings',
    defaults: configDefault
});
const Tradfri = require("node-tradfri-client");

let debugPreference = userConfig.get('Settings.advancedSettings.debugMode');
let f1mvURL = userConfig.get('Settings.MultiViewerForF1Settings.liveTimingURL') + '/api/graphql'
let f1mvCheckURL = userConfig.get('Settings.MultiViewerForF1Settings.liveTimingURL') + '/api/v1/live-timing/Heartbeat'
let ikeaDisabled = userConfig.get('Settings.ikeaSettings.ikeaDisable')
let goveeDisabled = userConfig.get('Settings.goveeSettings.goveeDisable')
let yeelightDisabled = userConfig.get('Settings.yeeLightSettings.yeeLightDisable')
let hueDisabled = userConfig.get('Settings.hueSettings.hueDisable')
let nanoLeafDisabled = userConfig.get('Settings.nanoLeafSettings.nanoLeafDisable')
let openRGBDisabled = userConfig.get('Settings.openRGBSettings.openRGBDisable')
let streamDeckDisabled = userConfig.get('Settings.streamDeckSettings.streamDeckDisable')

let discordRPCDisabled = userConfig.get('Settings.discordSettings.discordRPCDisable')

let ikeaSecurityCode = userConfig.get('Settings.ikeaSettings.securityCode');

let goveeInitialised = false;

let Govee;
let govee;


let analyticsPreference = userConfig.get('Settings.advancedSettings.analytics')
const APIURL = "https://api.joost.systems/api/v2"
let analyticsSent = false;

let updateChannel = userConfig.get('Settings.advancedSettings.updateChannel')
autoUpdater.channel = updateChannel;
const updateURL = APIURL + "/github/repos/JustJoostNL/f1mv-lights-integration/releases"

let userBrightness = parseInt(userConfig.get('Settings.generalSettings.defaultBrightness'))

let devMode = false;
let ikeaOnline = false;
let goveeOnline = false;
let hueOnline = false;
let nanoLeafOnline = false;
let openRGBOnline = false;
let streamDeckOnline = false;

let f1LiveSession = false;
let f1mvAPIOnline = false;
let updateAPIOnline = false;

let colorDevices = [];
let whiteDevices = [];
let TState;
let SState;
let SInfo;
let TStateCheck;
let SStateCheck;
let win;
let f1mvCheck = userConfig.get('Settings.MultiViewerForF1Settings.f1mvCheck')
const alwaysFalse = false;

let hideLogs = userConfig.get('Settings.generalSettings.hideLogs');

let errorCheck;

let lightsOnCounter = 0;
let lightsOffCounter = 0;
let flagSwitchCounter = 0;
let simulatedFlagCounter = 0;
let timesF1MVApiCalled = 0;
let timesCheckAPIS = 0;
let developerModeWasActivated = false;
const fetch = require('node-fetch').default;

let greenColor = userConfig.get('Settings.generalSettings.colorSettings.green');
let yellowColor = userConfig.get('Settings.generalSettings.colorSettings.yellow');
let redColor = userConfig.get('Settings.generalSettings.colorSettings.red');
let safetyCarColor = userConfig.get('Settings.generalSettings.colorSettings.safetyCar');
let vscColor = userConfig.get('Settings.generalSettings.colorSettings.vsc');
let vscEndingColor = userConfig.get('Settings.generalSettings.colorSettings.vscEnding');

let autoOff = userConfig.get('Settings.generalSettings.autoTurnOffLights')

let nanoLeafDevices = userConfig.get('Settings.nanoLeafSettings.devices')
let ikeaDevices = userConfig.get('Settings.ikeaSettings.deviceIDs');
let yeelightIPs = userConfig.get('Settings.yeeLightSettings.deviceIPs');
let hueLightIDsList = userConfig.get('Settings.hueSettings.deviceIDs');

let openRGBPort = userConfig.get('Settings.openRGBSettings.openRGBServerPort');
let openRGBIP = userConfig.get('Settings.openRGBSettings.openRGBServerIP');

const Ikea = require('node-tradfri-client');
let ikeaCreds;
let ikeaGateway;
let allIkeaDevices = [];

let noUpdateFound = false;

const Sentry = require("@sentry/electron");
Sentry.init({
    dsn: "https://e64c3ec745124566b849043192e58711@o4504289317879808.ingest.sentry.io/4504289338392576",
    release: "F1MV-Lights-Integration@" + app.getVersion(),
    tracesSampleRate: 0.2,
});

function createWindow() {
    win = new BrowserWindow({
        width: 820,
        height: 750,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            zoomFactor: 0.8
        },
        resizable: false,
        maximizable: false,
    })
    win.removeMenu();
    // use better scrollbar
    win.webContents.on('did-finish-load', () => {
        win.webContents.insertCSS(`
            ::-webkit-scrollbar {
                width: 10px;
            }
            ::-webkit-scrollbar-track {
                background: #1e1e1e;
            }
            ::-webkit-scrollbar-thumb {
                background: #888;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: #555;
            }
        `).then(r => {
            if(alwaysFalse) {
                console.log(r)
            }
        });
    });

    win.loadFile('index.html').then(r => {
        if (debugPreference) {
            console.log(r)
        }
    })
    if (BrowserWindow.getAllWindows().length === 0) {
        setTimeout(function () {
            initIntegrations().then(r => {
                if (alwaysFalse) {
                    console.log(r)
                }
            });
        }, 1000);
    } else if(BrowserWindow.getAllWindows().length === 1) {
        initIntegrations().then(r => {
            if (alwaysFalse) {
                console.log(r)
            }
        });
    }
}


app.whenReady().then(() => {
    createWindow()
    migrateConfig().then(r => {
        if (debugPreference) {
            console.log(r)
        }
    });

    electronLocalShortcut.register(win, 'shift+d', () => {
        if (!devMode) {
            devMode = true;
            developerModeWasActivated = true;
            //userConfig.set('Settings.advancedSettings.debugMode', true);
            //debugPreference = true;
            win.webContents.send('dev', true);
            if (userConfig.get('devConfig.autoStartDevTools')) {
                win.webContents.openDevTools();
            }
            win.webContents.send('log', 'Developer Mode Activated!')
        } else if (devMode) {
            devMode = false;
            //userConfig.set('Settings.advancedSettings.debugMode', false);
            //debugPreference = false;
            win.webContents.send('dev', false);
            win.webContents.closeDevTools()
            win.webContents.send('log', 'Developer Mode Deactivated!')
        }
    })

    if (testBuild){
        electronLocalShortcut.register(win, 'shift+t', () => {
            if (!testMode){
                testMode = true;
                win.webContents.send('test-mode', true);
            } else if (testMode){
                testMode = false;
                win.webContents.send('test-mode', false);
            }
        })

        ipcMain.on('test-button-test-mode', async () => {
            win.webContents.send('log', 'There is currently no test action for this button')
        })
    }

    const body = JSON.stringify({
        "userActive": "true"
    });
    const userActiveURL = APIURL + "/f1mv-lights-integration/analytics/useractive"
    fetch(userActiveURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    })

    autoUpdater.checkForUpdates().then(r => {
        if (alwaysFalse) {
            console.log(r)
        }
    })


    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', async () => {
    await sendAnalytics()
    if(streamDeckOnline){
        theStreamDeck.close();
    }
    if (openRGBOnline){
        client.disconnect();
    }
    if (process.platform !== 'darwin') {
        app.quit()
    }
})


ipcMain.on('open-config', () => {
    win.webContents.send('log', "Opening config file...");
    userConfig.openInEditor()
})

ipcMain.on('simulate', (event, arg) => {
    simulateFlag(arg).then(r => {
        if (alwaysFalse) {
            console.log(r)
            win.webContents.send('log', r);
        }
    })

})

ipcMain.on('toggle-devtools', () => {
    // check if dev tools are open
    if (win.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools()
    } else {
        win.webContents.openDevTools()
    }
})
ipcMain.on('toggle-logs', () => {
    if (hideLogs) {
        hideLogs = false;
        userConfig.set('Settings.generalSettings.hideLogs', false);
        win.webContents.send('hide-logs', false);
        win.webContents.send('log', 'Log visibility toggled on.')
    } else if (!hideLogs) {
        hideLogs = true;
        userConfig.set('Settings.generalSettings.hideLogs', true);
        win.webContents.send('hide-logs', true);
        win.webContents.send('log', 'Log visibility toggled off.')
    }
})

ipcMain.on('load-prefs', () => {
    // log pref:
    if(hideLogs){
        win.webContents.send('hide-logs', true);
    } else if (!hideLogs){
        win.webContents.send('hide-logs', false);
    }
    if (f1mvCheck){
        win.webContents.send('f1mv-check-html', true);
    } else if (!f1mvCheck){
        win.webContents.send('f1mv-check-html', false);
    }
})

ipcMain.on('toggle-debug', () => {
    if (debugPreference) {
        debugPreference = false;
        userConfig.set('Settings.advancedSettings.debugMode', false);
        win.webContents.send('log', 'Debug Mode Deactivated!')
    } else if (!debugPreference) {
        debugPreference = true;
        userConfig.set('Settings.advancedSettings.debugMode', true);
        win.webContents.send('log', 'Debug Mode Activated!')
    }
})

async function simulateFlag(arg) {
    if (arg === 'Green') {
        await controlAllLights(greenColor.r, greenColor.g, greenColor.b, userBrightness, "on", "green");
        simulatedFlagCounter++
    }
    if (arg === 'Red') {
        await controlAllLights(redColor.r, redColor.g, redColor.b, userBrightness, "on", "red");
        simulatedFlagCounter++
    }
    if (arg === 'Yellow') {
        await controlAllLights(yellowColor.r, yellowColor.g, yellowColor.b, userBrightness, "on", "yellow");
        simulatedFlagCounter++
    }
    if (arg === 'SC') {
        await controlAllLights(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, userBrightness, "on", "sc");
        simulatedFlagCounter++
    }
    if (arg === 'VSC') {
        await controlAllLights(vscColor.r, vscColor.g, vscColor.b, userBrightness, "on", "vsc");
        simulatedFlagCounter++
    }
    if (arg === 'vscEnding') {
        await controlAllLights(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, userBrightness, "on", "vscEnding");
        simulatedFlagCounter++
    }
    if (arg === 'alloff') {
        await controlAllLights(0, 0, 0, 0, "off", "alloff");
        simulatedFlagCounter++
    }
    if (arg === 'alloff') {
        win.webContents.send('log', "Turned off all lights!")
    } else if (arg !== 'vscEnding') {
        win.webContents.send('log', "Simulated " + arg + "!")
    }
    if (arg === 'vscEnding') {
        win.webContents.send('log', "Simulated VSC Ending!")
    }
}

ipcMain.on('updatecheck', () => {
    noUpdateFound = false;
    autoUpdater.checkForUpdates().then(r => {
        if (alwaysFalse) {
            console.log(r)
        }
    })
    win.webContents.send('log', 'Checking for updates...')
})

ipcMain.on('test-button-dev', async () => {
    console.log("Running action mapped on test button...")
    win.webContents.send('log', 'Running action mapped on test button...')
    await ikeaTest()
})
ipcMain.on('check-apis', async () => {
    await updateAllAPIs();
})
ipcMain.on('ikea-get-ids', async () => {
    win.webContents.send('toaster', 'Getting IKEA IDs...')
    win.webContents.send('log', 'Getting Ikea Device IDs...')
    await ikeaControl(0, 255, 0, userBrightness, "getDevices");
})
ipcMain.on('send-analytics-button', async () => {
    win.webContents.send('log', 'Running send analytics code...')
    await sendAnalytics();
})

ipcMain.on('f1mv-check', () => {
    if (f1mvCheck) {
        f1mvCheck = false;
        userConfig.set('Settings.MultiViewerForF1Settings.f1mvCheck', false)
        win.webContents.send('log', 'Disabled F1MV Sync!')
        win.webContents.send('f1mv-check-html', false)
    } else if (!f1mvCheck) {
        f1mvCheck = true;
        userConfig.set('Settings.MultiViewerForF1Settings.f1mvCheck', true)
        win.webContents.send('log', 'Enabled F1MV sync!')
        win.webContents.send('f1mv-check-html', true)
    }
})
ipcMain.on('auto-devtools', () => {
    const autoDevTools = userConfig.get('devConfig.autoStartDevTools');
    if (autoDevTools) {
        userConfig.set('devConfig.autoStartDevTools', false);
        win.webContents.send('log', 'Disabled auto start dev tools')
    } else if (!autoDevTools) {
        userConfig.set('devConfig.autoStartDevTools', true);
        win.webContents.send('log', 'Enabled auto start dev tools')
    }
})
ipcMain.on('send-config', () => {
    const config = userConfig.store;
    win.webContents.send('settings', config);
})
ipcMain.on('reload-from-config', () => {
    reloadFromConfig();
})
ipcMain.on('reset-colors-to-defaults', () => {
    userConfig.set('Settings.generalSettings.colorSettings', configDefault.Settings.generalSettings.colorSettings)
    reloadFromConfig();
    win.webContents.send('toaster', 'Reset colors to the defaults!')

})
ipcMain.on('hide-disabled-integrations', () => {
    const config = userConfig.store
    win.webContents.send('hide-disabled-integrations', config)
})
ipcMain.on('restart-app', () => {
    app.relaunch();
    app.exit(0);
})

ipcMain.on('linkHue', async () => {
    win.webContents.send('toaster', 'Searching for Hue bridge this may take a few seconds...')
    if (debugPreference) {
        win.webContents.send('log', 'Linking Hue...')
    }
    await hueInitialize();
})
ipcMain.on('getHueDevices', async () => {
    if (debugPreference) {
        win.webContents.send('log', 'Getting Hue Devices...')
    }
    await hueControl(0, 255, 0, userBrightness, "getDevices");
})
let canReceive = false;
ipcMain.on('nanoLeaf', async (event, args) => {
    if(args === 'openWindow'){
        if (debugPreference) {
            win.webContents.send('toaster', 'Opening Nanoleaf Setup Window...')
        }
        await nanoLeafInitialize('openWindow');
    }
    if(args === 'device'){
        canReceive = true;
    }
})
ipcMain.on('nanoLeafDevice', async (event, args) => {
    if(canReceive){
        if (debugPreference) {
            win.webContents.send('log', 'Connecting to Nanoleaf Device...')
        }
        await nanoLeafAuth(args);
        canReceive = false;
    }
})

ipcMain.on('saveConfig', (event, arg) => {
    let deviceIDs = arg.deviceIDs;
    let deviceIPs = arg.deviceIPs;
    let hueDeviceIDs = arg.hueDevices;
    const {
        defaultBrightness,
        autoTurnOffLights,
        liveTimingURL,
        hueDisable,
        ikeaDisable,
        securityCode,
        goveeDisable,
        openRGBDisable,
        openRGBServerIP,
        openRGBServerPort,
        nanoLeafDisable,
        yeeLightDisable,
        streamDeckDisable,
        discordRPCSetting,
        updateChannel,
        analytics,
        debugMode,
    } = arg


    deviceIPs = deviceIPs.split(',');
    deviceIDs = deviceIDs.split(',');
    hueDeviceIDs = hueDeviceIDs.split(',');


    userConfig.set('Settings.generalSettings.defaultBrightness', parseInt(defaultBrightness));
    userConfig.set('Settings.generalSettings.autoTurnOffLights', autoTurnOffLights);
    userConfig.set('Settings.MultiViewerForF1Settings.liveTimingURL', liveTimingURL);
    userConfig.set('Settings.hueSettings.hueDisable', hueDisable);
    userConfig.set('Settings.hueSettings.deviceIDs', hueDeviceIDs);
    userConfig.set('Settings.ikeaSettings.securityCode', securityCode);
    userConfig.set('Settings.ikeaSettings.deviceIDs', deviceIDs);
    userConfig.set('Settings.ikeaSettings.ikeaDisable', ikeaDisable);
    userConfig.set('Settings.goveeSettings.goveeDisable', goveeDisable);
    userConfig.set('Settings.openRGBSettings.openRGBDisable', openRGBDisable);
    userConfig.set('Settings.openRGBSettings.openRGBServerIP', openRGBServerIP);
    userConfig.set('Settings.openRGBSettings.openRGBServerPort', parseInt(openRGBServerPort));
    userConfig.set('Settings.nanoLeafSettings.nanoLeafDisable', nanoLeafDisable);
    userConfig.set('Settings.yeeLightSettings.yeeLightDisable', yeeLightDisable);
    userConfig.set('Settings.yeeLightSettings.deviceIPs', deviceIPs);
    userConfig.set('Settings.streamDeckSettings.streamDeckDisable', streamDeckDisable);
    userConfig.set('Settings.discordSettings.discordRPCDisable', discordRPCSetting);
    userConfig.set('Settings.advancedSettings.updateChannel', updateChannel);
    userConfig.set('Settings.advancedSettings.analytics', analytics);
    userConfig.set('Settings.advancedSettings.debugMode', debugMode);
});

ipcMain.on('saveConfigColors', (event, arg) => {
    const green = arg.green;
    const yellow = arg.yellow;
    const red = arg.red;
    const sc = arg.safetyCar;
    const vsc = arg.vsc;
    const vscEnding = arg.vscEnding;

    userConfig.set('Settings.generalSettings.colorSettings.green.r', parseInt(green.r));
    userConfig.set('Settings.generalSettings.colorSettings.green.g', parseInt(green.g));
    userConfig.set('Settings.generalSettings.colorSettings.green.b', parseInt(green.b));
    userConfig.set('Settings.generalSettings.colorSettings.yellow.r', parseInt(yellow.r));
    userConfig.set('Settings.generalSettings.colorSettings.yellow.g', parseInt(yellow.g));
    userConfig.set('Settings.generalSettings.colorSettings.yellow.b', parseInt(yellow.b));
    userConfig.set('Settings.generalSettings.colorSettings.red.r', parseInt(red.r));
    userConfig.set('Settings.generalSettings.colorSettings.red.g', parseInt(red.g));
    userConfig.set('Settings.generalSettings.colorSettings.red.b', parseInt(red.b));
    userConfig.set('Settings.generalSettings.colorSettings.safetyCar.r', parseInt(sc.r));
    userConfig.set('Settings.generalSettings.colorSettings.safetyCar.g', parseInt(sc.g));
    userConfig.set('Settings.generalSettings.colorSettings.safetyCar.b', parseInt(sc.b));
    userConfig.set('Settings.generalSettings.colorSettings.vsc.r', parseInt(vsc.r));
    userConfig.set('Settings.generalSettings.colorSettings.vsc.g', parseInt(vsc.g));
    userConfig.set('Settings.generalSettings.colorSettings.vsc.b', parseInt(vsc.b));
    userConfig.set('Settings.generalSettings.colorSettings.vscEnding.r', parseInt(vscEnding.r));
    userConfig.set('Settings.generalSettings.colorSettings.vscEnding.g', parseInt(vscEnding.g));
    userConfig.set('Settings.generalSettings.colorSettings.vscEnding.b', parseInt(vscEnding.b));
})

async function migrateConfig() {
    // if the config version is != 1 migrate the config
    if (userConfig.get('version') !== 11) {
        console.log('Migrating config...')
        win.webContents.send('log', 'Migrating config...')
        // migrate the config
        const oldConfig = userConfig.store;
        const newConfig = {
            "Settings": {
                "generalSettings": {
                    "autoTurnOffLights": oldConfig.Settings.generalSettings.autoTurnOffLights,
                    "defaultBrightness": oldConfig.Settings.generalSettings.defaultBrightness,
                    "hideLogs": oldConfig.Settings.generalSettings.hideLogs,
                    "colorSettings": {
                        green: {
                            r: oldConfig.Settings.generalSettings.colorSettings.green.r,
                            g: oldConfig.Settings.generalSettings.colorSettings.green.g,
                            b: oldConfig.Settings.generalSettings.colorSettings.green.b
                        },
                        yellow: {
                            r: 255,
                            g: 150,
                            b: 0
                        },
                        red: {
                            r: oldConfig.Settings.generalSettings.colorSettings.red.r,
                            g: oldConfig.Settings.generalSettings.colorSettings.red.g,
                            b: oldConfig.Settings.generalSettings.colorSettings.red.b
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
                    }
                },
                "MultiViewerForF1Settings": {
                    "liveTimingURL": "http://localhost:10101",
                    "f1mvCheck": oldConfig.Settings.MultiViewerForF1Settings.f1mvCheck,
                },
                "hueSettings": {
                    "hueDisable": oldConfig.Settings.hueSettings.hueDisable,
                    "deviceIDs": oldConfig.Settings.hueSettings.deviceIDs,
                    "token": oldConfig.Settings.hueSettings.token
                },
                "ikeaSettings": {
                    "ikeaDisable": oldConfig.Settings.ikeaSettings.ikeaDisable,
                    "securityCode": oldConfig.Settings.ikeaSettings.securityCode,
                    "deviceIDs": oldConfig.Settings.ikeaSettings.deviceIDs
                },
                "goveeSettings": {
                    "goveeDisable": oldConfig.Settings.goveeSettings.goveeDisable
                },
                "openRGBSettings": {
                    "openRGBDisable": oldConfig.Settings.openRGBSettings.openRGBDisable,
                    "openRGBServerIP": oldConfig.Settings.openRGBSettings.openRGBServerIP,
                    "openRGBServerPort": oldConfig.Settings.openRGBSettings.openRGBServerPort,
                },
                "nanoLeafSettings": {
                    "nanoLeafDisable": oldConfig.Settings.nanoLeafSettings.nanoLeafDisable,
                    "devices": oldConfig.Settings.nanoLeafSettings.devices
                },
                "yeeLightSettings": {
                    "yeeLightDisable": oldConfig.Settings.yeeLightSettings.yeeLightDisable,
                    "deviceIPs": oldConfig.Settings.yeeLightSettings.deviceIPs
                },
                "streamDeckSettings": {
                    "streamDeckDisable": true,
                },
                "discordSettings": {
                    "discordRPCDisable": false,
                },
                "advancedSettings": {
                    "debugMode": oldConfig.Settings.advancedSettings.debugMode,
                    "updateChannel": oldConfig.Settings.advancedSettings.updateChannel,
                    "analytics": oldConfig.Settings.advancedSettings.analytics
                }
            },
            "version": 11
        }
        userConfig.clear();
        userConfig.set(newConfig);
        console.log('Config migrated!')
        win.webContents.send('log', 'Config migrated!')
    }
}
async function f1mvAPICall() {
    if (f1mvCheck) {
        try {
            timesF1MVApiCalled++
            const response = await fetch(f1mvURL, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    'query': 'query {\n  liveTimingState {\n    SessionStatus\n SessionInfo\n TrackStatus\n  }\n}'
                })
            });
            if (response.status === 200) {
                const responseData = await response.json();
                SState = responseData.data.liveTimingState.SessionStatus.Status;
                SInfo = responseData.data.liveTimingState.SessionInfo;
                TState = responseData.data.liveTimingState.TrackStatus.Status;
            }
        } catch (e) {
            if (errorCheck !== true) {
                errorCheck = true;
                win.webContents.send('log', "Failed to get the data from the F1MV API: " + e);
            }
        }
    }
}

async function f1mvLightSync() {
    await f1mvAPICall();
    if (TStateCheck !== TState && SState !== "Ends" && SState !== "Finalised") {
        flagSwitchCounter++
        switch (TState) {
            case "1":
                win.webContents.send('log', "Green flag!")
                await controlAllLights(greenColor.r, greenColor.g, greenColor.b, userBrightness, "on", "green");
                TStateCheck = TState
                break;
            case "2":
                win.webContents.send('log', "Yellow flag!")
                await controlAllLights(yellowColor.r, yellowColor.g, yellowColor.b, userBrightness, "on", "yellow");
                TStateCheck = TState
                break;
            case "4":
                win.webContents.send('log', "Safety car!")
                await controlAllLights(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, userBrightness, "on", "safetyCar");
                TStateCheck = TState
                break;
            case "5":
                win.webContents.send('log', "Red flag!")
                await controlAllLights(redColor.r, redColor.g, redColor.b, userBrightness, "on", "red");
                TStateCheck = TState
                break;
            case "6":
                win.webContents.send('log', "Virtual safety car!")
                await controlAllLights(vscColor.r, vscColor.g, vscColor.b, userBrightness, "on", "vsc");
                TStateCheck = TState
                break;
            case "7":
                win.webContents.send('log', "VSC Ending")
                await controlAllLights(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, userBrightness, "on", "vscEnding");
                TStateCheck = TState
                break;
        }
    } else if (SState === "Ends" || SState === "Finalised") {
        if (SStateCheck !== SState) {
            if (autoOff) {
                win.webContents.send('log', "Session ended, turning off lights...")
                await controlAllLights(0, 0, 0, 0, "off", "sessionEnded");
                SStateCheck = SState
            }
        }
    }
}

async function controlAllLights(r, g, b, brightness, action, flag) {
    if (!goveeDisabled) {
        await goveeControl(r, g, b, brightness, action)
    }
    if (!yeelightDisabled) {
        await yeelightControl(r, g, b, brightness, action)
    }
    if (!ikeaDisabled) {
        await ikeaControl(r, g, b, brightness, action, flag)
    }
    if (!hueDisabled) {
        await hueControl(r, g, b, brightness, action)
    }
    if (!nanoLeafDisabled) {
        await nanoLeafControl(r, g, b, brightness, action)
    }
    if (!openRGBDisabled) {
        await openRGBControl(r, g, b, brightness, action)
    }
    if (!streamDeckDisabled) {
        await streamDeckControl(r, g, b, brightness, action)
    }
}

setTimeout(function () {
    setInterval(function () {
        if (BrowserWindow.getAllWindows().length > 0) {
            if (f1mvCheck) {
                f1mvLightSync().then(r => {
                    if (alwaysFalse) {
                        console.log(r)
                    }
                });
            }
        }
    }, 300);
}, 1000);

async function initIntegrations() {
    const integrations = [
        { name: 'ikea', func: ikeaInitialize, disabled: ikeaDisabled },
        { name: 'govee', func: goveeInitialize, disabled: goveeDisabled },
        { name: 'hue', func: hueInitialize, disabled: hueDisabled },
        { name: 'openRGB', func: openRGBInitialize, disabled: openRGBDisabled },
        { name: 'streamDeck', func: streamDeckInitialize, disabled: streamDeckDisabled },
        { name: 'discordRPC', func: discordRPC, disabled: false }
    ];

    for (const integration of integrations) {
        if (!integration.disabled) {
            await integration.func();
        }
    }

    setInterval(checkMiscAPIS, 15000);
    await sendAllAPIStatus()
}

async function updateAllAPIs(){
    await checkMiscAPIS()
    await sendAllAPIStatus()
}

setInterval(async () => {
    if (BrowserWindow.getAllWindows().length > 0) {
        await sendAllAPIStatus();
    }
}, 5000);

async function sendAllAPIStatus() {
    const statuses = [
        { name: 'ikea', online: ikeaOnline },
        { name: 'govee', online: goveeOnline },
        { name: 'hue', online: hueOnline },
        { name: 'openRGB', online: openRGBOnline },
        { name: 'yeelight', online: !yeelightDisabled },
        { name: 'streamDeck', online: streamDeckOnline },
        { name: 'nanoLeaf', online: nanoLeafDevices.length > 0 },
        { name: 'f1mv', online: f1mvAPIOnline },
        { name: 'f1tv', online: f1LiveSession },
        { name: 'update', online: updateAPIOnline }
    ];

    for (const status of statuses) {
        if (status.online) {
            win.webContents.send(`${status.name}API`, 'online');
        }
    }
}

async function discordRPC(){
    const clientId = '1027664070993772594';
    const DiscordRPC = require('discord-rpc');
    const RPC = new DiscordRPC.Client({ transport: 'ipc' });

    DiscordRPC.register(clientId);

    let nowDate = Date.now();

    async function setActivity() {

        if(!SInfo) {
            SInfo = {
                Name: "nothing"
            }
        }

        if (!RPC) return;
        await RPC.setActivity({
            details: `Watching ${SInfo.Name} with MultiViewer`,
            state: `F1MV-Lights-Integration is running`,
            startTimestamp: nowDate,
            largeImageKey: 'f1mv_logo',
            largeImageText: 'Logo of F1MV',
            instance: false,
            buttons: [
                {
                    label: `Download MultiViewer for F1!`,
                    url: 'https://multiviewer.app/download',
                },
                {
                    label: `Download F1MV-Lights-Integrat..`,
                    url: 'https://github.com/JustJoostNL/F1MV-Lights-Integration/releases/latest',
                }
            ],
        });
    }

    RPC.on('ready', async () => {
        if(!discordRPCDisabled && f1mvAPIOnline) {
            await setActivity();
        }
        setInterval(async () => {
            if(!discordRPCDisabled && f1mvAPIOnline) {
                await setActivity();
            } else{
                await RPC.clearActivity();
            }
        }, 15000);
    });

    try {
        await RPC.login({clientId});
    } catch (e) {
        setTimeout(async () => {
            win.webContents.send('log', "Failed to start Discord RPC, is Discord running?");
        }, 1000);
    }
}

if(!goveeInitialised && !goveeDisabled){
    Govee = require("govee-lan-control");
    govee = new Govee.default();
}

setInterval(function () {
    if(!goveeInitialised && !goveeDisabled){
        Govee = require("govee-lan-control");
        govee = new Govee.default();
        goveeInitialised = true;
        goveeOnline = true;
    } else if (goveeDisabled){
        goveeOnline = false;
    }
}, 2000);


async function goveeControl(r, g, b, brightness, action) {
    govee.devicesArray.forEach(device => {
        if (debugPreference) {
            win.webContents.send('log', "Govee device selected: " + device.model);
        }
        if (action === "on") {
            lightsOnCounter++
            if (debugPreference) {
                win.webContents.send('log', "Turning on the Govee light with the following values: " + "R: " + r + " G: " + g + " B: " + b + " Brightness: " + brightness);
            }
            brightness = parseInt(brightness);
            r = parseInt(r);
            g = parseInt(g);
            b = parseInt(b);
            device.actions.setBrightness(brightness);
            device.actions.setColor({
                rgb: [
                    r,
                    g,
                    b
                ],
            });
            if (device.state.isOn === 0) {
                device.actions.setOn();
            }
        }
        if (action === "off") {
            lightsOffCounter++
            if (debugPreference) {
                win.webContents.send('log', "Turning off Govee light " + device.model);
            }
            device.actions.setOff();
        }
        if (action === "getState") {
            if (debugPreference) {
                win.webContents.send('log', "Getting the state of Govee light " + device.model);
            }
            if (device.state.isOn === 1) {
                win.webContents.send('log', "The light is on");
            } else {
                win.webContents.send('log', "The light is off");
            }
            win.webContents.send('log', "The brightness is: " + device.state.brightness);
            win.webContents.send('log', "The color is: " + device.state.color);
        }
    });
}

async function goveeInitialize() {
    goveeOnline = true;
    govee.on("deviceAdded", (device) => {
        if (debugPreference) {
            win.webContents.send('log', "Govee device found: " + device.model);
        }

    });
}
async function ikeaInitialize() {
    const result = await Ikea.discoverGateway();
    if (!result) {
        console.log("No gateways found!");
        return;
    } else {
        ikeaGateway = result.addresses[0];
    }
    const tradfriClient = new Tradfri.TradfriClient(ikeaGateway, {
        watchConnection: true,
    });
    const {identity, psk} = await tradfriClient.authenticate(ikeaSecurityCode);
    ikeaCreds = {identity, psk};
    try {
        await tradfriClient.connect(ikeaCreds.identity, ikeaCreds.psk);
        if(debugPreference){
            win.webContents.send('log', "Connected to IKEA Tradfri Gateway");
        }
        ikeaOnline = true;
    } catch {
        win.webContents.send('log', "Failed to connect to IKEA Tradfri Gateway");
        ikeaOnline = false;
    }
    if(ikeaOnline) {
        try {
            await tradfriClient.on("device updated", (d) => {
                allIkeaDevices[d.instanceId] = d;
            }).observeDevices();
        } catch {
            win.webContents.send('log', "Failed to observe IKEA Tradfri devices");
        }

        await ikeaCheckSpectrum();
    }

}

async function ikeaCheckSpectrum(){
    colorDevices = [];
    whiteDevices = [];
    for (let i = 0; i < ikeaDevices.length; i++) {
        if (debugPreference) {
            win.webContents.send('log', "Checking if Ikea device is RGB or White")
            win.webContents.send('log', "Device to check: " + ikeaDevices[i])
        }
        const deviceToCheck = allIkeaDevices[ikeaDevices[i]];
        if (deviceToCheck.lightList[0].spectrum === "rgb"){
            if (debugPreference) {
                win.webContents.send('log', "Device" + ikeaDevices[i] + " is RGB")
            }
            colorDevices.push(ikeaDevices[i]);
        } else {
            if (debugPreference) {
                win.webContents.send('log', "Device" + ikeaDevices[i] + " is White")
            }
            whiteDevices.push(ikeaDevices[i]);
        }

    }
}

async function ikeaControl(r, g, b, brightness, action, flag) {
    if (action === "getDevices") {
        let result = [];
        for (const deviceId in allIkeaDevices){
            const device = allIkeaDevices[deviceId];
            if (device.type !== 2) {
                continue;
            }
            result.push({
                id: device.instanceId,
                name: device.name,
                state: device.lightList[0].onOff,
                spectrum: device.lightList[0].spectrum,
            });

        }
        let html = "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'><title>Devices</title><link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css'><script src='https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js'></script><script src='https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js'></script><script src='https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js'></script></head><body><div class='container'><table class='table table-dark table-striped'><thead><tr><th>Device Name</th><th>Device ID</th><th>Device Is On</th><th>Color support</th></tr></thead><tbody>";
        result.forEach(device => {
            html = html + "<tr><td>" + device.name + "</td><td>" + device.id + "</td><td>" + device.state + "</td><td>" + device.spectrum + "</td></tr>";
        });
        html = html + "</tbody></table></div></body></html>";
        const path = require('path');
        const savePath = path.join(app.getAppPath(), 'devices.html');
        fs.writeFile(savePath, html, function (err) {
            if (err) throw err;
        });
        const win = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true
            },
            resizable: false,
            maximizable: false,
            minimizable: true,
        });
        win.removeMenu();
        win.webContents.on('did-finish-load', () => {
            win.webContents.insertCSS(`
            ::-webkit-scrollbar {
                width: 10px;
            }
            ::-webkit-scrollbar-track {
                background: #1e1e1e;
            }
            ::-webkit-scrollbar-thumb {
                background: #888;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: #555;
            }
        `).then(r => {
                if(alwaysFalse) {
                    console.log(r)
                }
            });
        });
        await win.loadFile(savePath);
    }

    if (action === "on" && ikeaOnline === true) {
        lightsOnCounter++;
        let hue;
        if (debugPreference) {
            win.webContents.send('log', "Turning on the Ikea lights...");
        }

        // convert rgb to hsl
        const colorConvert = require("color-convert");
        const hsl = colorConvert.rgb.hsl(r, g, b);
        hue = hsl[0];
        if (debugPreference) {
            win.webContents.send('log', "The converted hue value from the given RGB value for Ikea is: " + hue);
        }
        colorDevices.forEach(device => {
            if(debugPreference){
                win.webContents.send('log', "Turning on the Ikea RGB light with the ID: " + device);
            }
            device = allIkeaDevices[device].lightList[0];
            device.toggle(true, 0);
            device.setHue(hue, 0);
            device.setBrightness(brightness, 0);
        });
        whiteDevices.forEach(device => {
            if(debugPreference){
                win.webContents.send('log', "Turning on the Ikea White light with the ID: " + device);
            }
            device = parseInt(device);
            device = allIkeaDevices[device].lightList[0];
            if (flag !== "green") {
                device.toggle(true, 0);
                device.setBrightness(brightness, 0);
            } else if (flag === "green") {
                device.toggle(false, 0);
            }
        });

    }
    if (action === "off" && ikeaOnline === true) {
        lightsOffCounter++;
        colorDevices.forEach(device => {
            if(debugPreference){
                win.webContents.send('log', "Turning off the Ikea RGB light with the ID: " + device);
            }
            device = parseInt(device);
            device = allIkeaDevices[device].lightList[0];
            device.toggle(false, 0);
        });
        whiteDevices.forEach(device => {
            if(debugPreference){
                win.webContents.send('log', "Turning off the Ikea White light with the ID: " + device);
            }
            device = parseInt(device);
            device = allIkeaDevices[device].lightList[0];
            device.toggle(false, 0);
        });
    }
}

async function yeelightControl(r, g, b, brightness, action) {
    if (!yeelightDisabled) {
        yeelightIPs.forEach((light) => {
            const bulb = new Bulb(light);
            bulb.on('connected', (lamp) => {
                try {
                    if (action === "on") {
                        if(debugPreference){
                            win.webContents.send('log', "Turning on the Yeelight light with the IP: " + light);
                        }
                        lightsOnCounter++
                        lamp.color(r, g, b);
                        lamp.brightness(brightness);
                        lamp.onn();
                        lamp.disconnect();
                    }
                    if (action === "off") {
                        if(debugPreference){
                            win.webContents.send('log', "Turning off the Yeelight light with the IP: " + light);
                        }
                        lightsOffCounter++
                        lamp.off();
                        lamp.disconnect();
                    }
                } catch (err) {
                    if (debugPreference) {
                        win.webContents.send('log', "Error while performing an action on a YeeLight light: " + err);
                    }
                }
            });
            bulb.on('error', (err) => {
                if (debugPreference) {
                    win.webContents.send('log', "Error while connecting to a YeeLight light: " + err);
                }
            });
            bulb.connect();
        });
    }
}

const hue = require("node-hue-api");
let hueApi;
let hueClient;
let hueLights;
let createdUser;
let authHueApi;
let token;
async function hueInitialize() {
    hueApi = await hue.discovery.nupnpSearch();
    if (hueApi.length === 0) {
        win.webContents.send('toaster', "No Hue bridges found");
        console.error("Unable to find a Hue bridge on the network");
        hueOnline = false;
    } else {
        hueOnline = true;
        hueClient = await hue.v3.api.createLocal(hueApi[0].ipaddress).connect();
        // toast that the bridge is found + IP
        win.webContents.send('toaster', "Hue bridge found at: " + hueApi[0].ipaddress);
        if (debugPreference) {
            win.webContents.send('log', "Hue bridge found at: " + hueApi[0].ipaddress);
        }

        const appName = "F1MV-Lights-Integration";
        const deviceName = "DeviceName";

        try {
            if (userConfig.get('Settings.hueSettings.token') === undefined) {
                if (debugPreference) {
                    win.webContents.send('log', "No token found, creating one...");
                    win.webContents.send('toaster', "No token found, creating one...");
                }
                createdUser = await hueClient.users.createUser(appName, deviceName)
                userConfig.set('Settings.hueSettings.token', createdUser.username)
                if (debugPreference) {
                    win.webContents.send('log', "Token created: " + createdUser.username);
                    win.webContents.send('toaster', "Token created: " + createdUser.username);
                }
                token = createdUser.username
            } else {
                if (debugPreference) {
                    win.webContents.send('log', "Token found: " + userConfig.get('Settings.hueSettings.token'));
                    win.webContents.send('toaster', "Token found: " + userConfig.get('Settings.hueSettings.token'));
                }
                token = userConfig.get('Settings.hueSettings.token');
            }

            authHueApi = await hue.v3.api.createLocal(hueApi[0].ipaddress).connect(token);

            hueLights = await authHueApi.lights.getAll();

            if (hueLights !== undefined) {
                if (debugPreference) {
                    win.webContents.send('log', "Amount of Hue lights found: " + hueLights.length);
                    win.webContents.send('toaster', "Amount of Hue lights found: " + hueLights.length);
                }
                hueLights.forEach((light) => {
                    if (debugPreference) {
                        win.webContents.send('log', "Hue light found: " + light.name);
                    }
                });
            } else {
                win.webContents.send('log', "No Hue lights found or an error occurred");
                win.webContents.send('toaster', "No Hue lights found or an error occurred");
            }
        } catch (err) {
            try {
                if (err.getHueErrorType() === 101) {
                    win.webContents.send('toaster', "The Link button on the bridge was not pressed. Please press the Link button and try again.");
                } else {
                    win.webContents.send('log', `Unexpected Error: ${err.message}`);
                }
            } catch (error) {
                win.webContents.send('log', `Unexpected Error: ${err.message}`);
            }
        }

    }
}

async function hueControl(r, g, b, brightness, action) {
    brightness = Math.round((brightness / 100) * 254);

    const colorConvert = require("color-convert");
    if (!hueDisabled && hueOnline) {
        if (action === "getDevices") {
            if (hueLights === null || hueLights === undefined) {
                win.webContents.send('toaster', "No Hue lights found or an error occurred.");
            } else {
                let html = "<!DOCTYPE html><html lang='en'><head><title>Hue Lights</title><link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css'><style>table { background-color: #333; color: #fff; }</style><script src='https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js'></script></head><body><div class='container'><table class='striped'><thead><tr><th>Light Name</th><th>Light ID</th><th>Device is on</th></tr></thead><tbody>";
                hueLights.forEach((light) => {
                    html += "<tr><td>" + light.name + "</td><td>" + light.id + "</td><td>" + light.state.on + "</td></tr>";
                });
                html += "</tbody></table></div></body></html>";
                const path = require('path');
                const savePath = path.join(app.getAppPath(), 'devicesHue.html');
                fs.writeFile(savePath, html, function (err) {
                    if (err) throw err;
                });

                const win = new BrowserWindow({
                    width: 800,
                    height: 600,
                    webPreferences: {
                        nodeIntegration: true
                    }
                });
                win.removeMenu();
                await win.loadFile(savePath);
            }
        }


        const {
            LightState
        } = require('node-hue-api').v3.lightStates;

        // Convert the RGB values to hue-saturation values
        const [h, s, v] = colorConvert.rgb.hsv([r, g, b]);
        const [hue, sat] = colorConvert.hsv.hsl([h, s, v]);

        for (const light of hueLightIDsList) {
            if (action === "on") {
                // Set the brightness and color of the light
                lightsOnCounter++;
                await authHueApi.lights.setLightState(light, new LightState()
                    .on(true)
                    .bri(brightness)
                    .sat(sat)
                    .hue(hue)
                );
            } else if (action === "off") {
                lightsOffCounter++;
                await authHueApi.lights.setLightState(light, new LightState()
                    .on(false)
                );
            }
        }
    }
}
let nanoLeafWin;
async function nanoLeafInitialize(action) {
    if(action === "openWindow"){
        // create a new browser window and open the nanoleaf-setup.html file
        nanoLeafWin = new BrowserWindow({
            width: 650,
            height: 800,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                zoomFactor: 0.8
            },
            resizable: false,
            maximizable: false
        });
        nanoLeafWin.removeMenu();
        electronLocalShortcut.register(nanoLeafWin, 'ctrl+shift+f7', () => {
            nanoLeafWin.webContents.openDevTools();
        })
        nanoLeafWin.webContents.on('did-finish-load', () => {
            nanoLeafWin.webContents.insertCSS(`
            ::-webkit-scrollbar {
                width: 10px;
            }
            ::-webkit-scrollbar-track {
                background: #1e1e1e;
            }
            ::-webkit-scrollbar-thumb {
                background: #888;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: #555;
            }
        `);
        });

        await nanoLeafWin.loadFile('nanoleaf-setup.html');
    }
}
let deviceToken;
let authFailed = false;
let exist = false;
async function nanoLeafAuth(ip) {
    nanoLeafWin.webContents.send('log', "Connecting to the Nanoleaf device, this may take a few seconds...");
    authFailed = false;
    const AuroraAPI = require('nanoleaves');
    const auroraTemp = new AuroraAPI({
        host: ip
    });
    auroraTemp.newToken().then(token => {
        deviceToken = token;
        // check if the ip/hostname is already in the config, if so, update the token, if not, add it
        if (nanoLeafDevices.length > 0) {
            for (const device of nanoLeafDevices) {
                if (device.host === ip) {
                    exist = true;
                    nanoLeafWin.webContents.send('log', "Device already found, updating token...");
                    userConfig.set('Settings.nanoLeafSettings.devices.' + nanoLeafDevices.indexOf(device) + '.token', token);
                    nanoLeafWin.webContents.send('log', "Token updated!");
                    nanoLeafWin.webContents.send('log', "This window will close in 7 seconds, and you will be asked if you want to add another device.");
                    setTimeout(() => {
                        nanoLeafWin.close();
                    }, 7000);
                    setTimeout(() => {
                        addOtherDeviceDialog();
                    }, 8000);
                    break;
                }
            }
        }
        if(!exist) {
            if (userConfig.get('Settings.nanoLeafSettings.devices') === []) {
                userConfig.set('Settings.nanoLeafSettings.devices', [
                    {
                        host: ip,
                        token: deviceToken
                    }
                ]);
            } else if (userConfig.get('Settings.nanoLeafSettings.devices') !== []) {
                // add new device to the array
                let newDevices = userConfig.get('Settings.nanoLeafSettings.devices');
                newDevices.push({
                    host: ip,
                    token: deviceToken
                });
                userConfig.set('Settings.nanoLeafSettings.devices', newDevices);
            }
        }
    }).catch(err => {
        // check if the error includes 401
        if (err.message.includes("401")) {
            nanoLeafWin.webContents.send('log', "The authorization failed, did you press and hold the power button? Please read the text above and try again.");
            authFailed = true;
        } else {
            nanoLeafWin.webContents.send('log', "An error occurred while connecting to the Nanoleaf device, please try again.");
        }
    });
    await new Promise(r => setTimeout(r, 2000));
    if(!authFailed && exist === false) {
        let found;
        const nanoLeafDevices = userConfig.get('Settings.nanoLeafSettings.devices');
        for (const device of nanoLeafDevices) {
            if (device.host === ip) {
                found = true;
                deviceToken = device.token;
                break;
            }
        }
        if (!found) {
            nanoLeafWin.webContents.send('log', "Error: Could not connect to the Nanoleaf device, please try again.");
            return;
        }
        if (found) {
            // create a new aurora object with the token and host
            const aurora = new AuroraAPI({
                host: ip,
                token: deviceToken
            });
            try {
                aurora.identify().then(() => {
                    nanoLeafWin.webContents.send('log', "Successfully connected to the Nanoleaf device!");
                    nanoLeafWin.webContents.send('log', "If you saw the Nanoleaf device blink, the connection is successful, and you can close this window!");
                    nanoLeafWin.webContents.send('log', "If you didn't see the Nanoleaf device blink, please try again!");
                });
                const dialogOptions = {
                    type: 'info',
                    buttons: ['The connection was successful!', 'I want to try again!'],
                    title: 'Connection Review!',
                    message: 'If you saw the Nanoleaf device blink, the connection is successful, and you can close this window!\nIf you didn\'t saw the Nanoleaf device blink, please try again!',
                    defaultId: 0
                };
                dialog.showMessageBox(nanoLeafWin, dialogOptions).then(result => {
                    if (result.response === 0) {
                        nanoLeafWin.close();
                        const config = userConfig.store;
                        win.webContents.send('settings', config);
                        setTimeout(() => {
                            addOtherDeviceDialog();
                        }, 500);
                    } else{
                        nanoLeafWin.close();
                        nanoLeafInitialize("openWindow");
                        // remove the device just added from the config
                        let newDevices = userConfig.get('Settings.nanoLeafSettings.devices');
                        newDevices.pop();
                        userConfig.set('Settings.nanoLeafSettings.devices', newDevices);
                        setTimeout(() => {
                            nanoLeafWin.webContents.send('log', "You can now try again!");
                        }, 1000);
                    }
                });
            } catch (error) {
                if (error.message.includes("401")) {
                    nanoLeafWin.webContents.send('log', "Error: The token is invalid, please try again.");
                } else {
                    nanoLeafWin.webContents.send('log', "Error: Could not connect to the Nanoleaf device, please try again.");
                }
            }
        }
    }
}

async function nanoLeafControl(r, g, b, brightness, action){
    if(action === "on" && nanoLeafOnline){
        lightsOnCounter++
        if(debugPreference){
            win.webContents.send('log', "Turning all the available Nanoleaf devices on...");
        }
        let hue;
        const colorConvert = require("color-convert");
        const hsl = colorConvert.rgb.hsl(r, g, b);
        hue = hsl[0];
        if (debugPreference) {
            win.webContents.send('log', "Converted the given RGB for Nanoleaf to a hue value, new value is: " + hue);
        }
        for (const device of nanoLeafDevices) {
            if(debugPreference){
                win.webContents.send('log', "Turning on Nanoleaf device with host: " + device.host + " and token: " + device.token);
            }
            const AuroraAPI = require('nanoleaves');
            const aurora = new AuroraAPI({
                host: device.host,
                token: device.token
            });
            aurora.on();
            aurora.setHue(hue);
            aurora.setBrightness(brightness);
        }
    } else if(action === "off" && nanoLeafOnline){
        lightsOffCounter++
        if(debugPreference){
            win.webContents.send('log', "Turning all the available Nanoleaf devices off...");
        }
        for (const device of nanoLeafDevices) {
            if(debugPreference){
                win.webContents.send('log', "Turning off Nanoleaf device with host: " + device.host + " and token: " + device.token);
            }
            const AuroraAPI = require('nanoleaves');
            const aurora = new AuroraAPI({
                host: device.host,
                token: device.token
            });
            aurora.off();
        }
    }
}
function addOtherDeviceDialog(){
    if(debugPreference){
        win.webContents.send('log', "Opening the add other device dialog...");
    }
    const dialogOptions = {
        type: 'info',
        buttons: ['Yes', 'No'],
        title: 'Add another device?',
        message: 'Do you want to add another device?',
        defaultId: 0
    };
    dialog.showMessageBox(nanoLeafWin, dialogOptions).then(result => {
        if (result.response === 0) {
            nanoLeafInitialize("openWindow").then(r => {
                if(alwaysFalse){
                    console.log(r);
                }
            });
        }
    });
}

ipcMain.on('link-openrgb', () => {
    openRGBInitialize(true).then(r => {
        if(alwaysFalse){
            console.log(r);
        }
    });
});

const { Client } = require("openrgb-sdk")
let client;
async function openRGBInitialize(toast){
    try {
        if(openRGBOnline){
            if(debugPreference){
                win.webContents.send('log', "Already connected to OpenRGB, closing current connection...");
            }
            if(toast){
                win.webContents.send('toaster', "Reconnecting to OpenRGB...");
            }
            client.disconnect();
        } else {
            if(toast){
                win.webContents.send('toaster', "Connecting to OpenRGB...");
            }
        }
        client = new Client("F1MV-Lights-Integration", openRGBPort, openRGBIP);
        await client.connect()
        if(debugPreference){
            win.webContents.send('log', "Connected to OpenRGB!");
        }
        if(toast){
            win.webContents.send('toaster', "Connected to OpenRGB!");
        }
        openRGBOnline = true;
    } catch (error) {
        openRGBOnline = false;
        setTimeout(() => {
            win.webContents.send('log', "Error: Could not connect to OpenRGB, please make sure that OpenRGB is running and that the IP + Port are correct!");
            if(toast){
                win.webContents.send('toaster', "Could not connect to OpenRGB!");
            }
        }, 1500);
    }
}
async function openRGBControl(r, g, b, brightness, action){
    if(openRGBOnline) {
        if (debugPreference) {
            win.webContents.send('log', "Getting all the available OpenRGB devices...");
        }
        const deviceCount = await client.getControllerCount()
        if (debugPreference) {
            win.webContents.send('log', "Found " + deviceCount + " OpenRGB devices!");
        }
        if (action === 'on') {
            lightsOnCounter++
            if (debugPreference) {
                win.webContents.send('log', "Turning all the available OpenRGB devices on...");
            }
            for (let i = 0; i < deviceCount; i++) {
                let device = await client.getControllerData(i)
                await client.updateMode(i, 0)

                if (debugPreference) {
                    win.webContents.send('log', "Turning on OpenRGB device with name: " + device.name + " and values: " + r + ", " + g + ", " + b + ", " + brightness);
                }

                const colors = Array(device.colors.length).fill({
                    red: r,
                    green: g,
                    blue: b
                })
                await client.updateLeds(i, colors)
                if (debugPreference) {
                    win.webContents.send('log', 'Successfully updated the colors of the OpenRGB device with name: ' + device.name);
                }
            }
        }
        if (action === 'off') {
            lightsOffCounter++
            if (debugPreference) {
                win.webContents.send('log', "Turning all the available OpenRGB devices off...");
            }
            for (let i = 0; i < deviceCount; i++) {
                let device = await client.getControllerData(i)
                await client.updateMode(i, 0)

                if (debugPreference) {
                    win.webContents.send('log', "Turning off OpenRGB device with name: " + device.name);
                }

                const colors = Array(device.colors.length).fill({
                    red: 0,
                    green: 0,
                    blue: 0
                })
                await client.updateLeds(i, colors)
                if (debugPreference) {
                    win.webContents.send('log', 'Successfully updated the colors of the OpenRGB device with name: ' + device.name);
                }
            }
        }
    } else if(debugPreference){
        win.webContents.send('log', "There is no active connection to OpenRGB, please make sure that OpenRGB is running and that the IP + Port are correct!");
    }
}

let theStreamDeck;
let streamDeckKeyCount;
async function streamDeckInitialize(){
    try {
        const { openStreamDeck }  = require('@elgato-stream-deck/node')
        theStreamDeck = await openStreamDeck()
        theStreamDeck.clearPanel();
        streamDeckOnline = true;
    } catch (error) {
        setTimeout(() => {
            win.webContents.send('log', "Error: Could not connect to Stream Deck, please make sure that the Stream Deck is connected and that the software is installed!");
        }, 1500);
        streamDeckOnline = false;
    }
    if(streamDeckOnline){
        if(debugPreference){
            setTimeout(() => {
                win.webContents.send('log', "Connected to Stream Deck!");
            }, 1500);
        }
        streamDeckKeyCount = theStreamDeck.NUM_KEYS
        if(debugPreference){
            setTimeout(() => {
                win.webContents.send('log', "Found " + streamDeckKeyCount + " keys on the Stream Deck!");
            }, 1500);
        }
    }
}

async function streamDeckControl(r, g, b, brightness, action){
    if(streamDeckOnline){
        if(action === 'on'){
            lightsOnCounter++
            if(debugPreference){
                win.webContents.send('log', "Turning all the available Stream Deck keys on...");
            }
            for (let i = 0; i < streamDeckKeyCount; i++) {
                theStreamDeck.setBrightness(brightness)
                theStreamDeck.fillKeyColor(i, r, g, b)
                // if(debugPreference){
                //     win.webContents.send('log', "Turning on Stream Deck key with index: " + i + " and values: " + r + ", " + g + ", " + b + ", " + brightness);
                // }
            }
        }
        if(action === 'off'){
            lightsOffCounter++
            if(debugPreference){
                win.webContents.send('log', "Turning all the available Stream Deck keys off...");
            }
            for (let i = 0; i < streamDeckKeyCount; i++) {
                theStreamDeck.fillKeyColor(i, 0, 0, 0)
                // if(debugPreference){
                //     win.webContents.send('log', "Turning off Stream Deck key with index: " + i);
                // }
            }
        }
    } else if(debugPreference){
        win.webContents.send('log', "There is no active connection to Stream Deck, please make sure that the Stream Deck is connected and that the software is installed!");
    }
}

async function checkMiscAPIS() {
    if(debugPreference){
        win.webContents.send('log', "Checking the Update and F1 Live Session API..");
    }
    timesCheckAPIS++
    fetch(updateURL)
        .then(function () {
            updateAPIOnline = true;
        })
        .catch(function () {
            updateAPIOnline = false;
        });

    try {

        const response = await fetch(f1mvCheckURL);
        const data = await response.json();
        f1mvAPIOnline = data.error !== 'No data found, do you have live timing running?';
    } catch (error) {
        if(errorCheck === false){
            win.webContents.send('log', 'Error: Could not connect to the F1MV API, please make sure that you have F1MV open, and the Live Timing is running!');
        }
        f1mvAPIOnline = false;
        errorCheck = true;
    }


    const liveSessionCheckURL = APIURL + "/f1tv/checklivesession";
    const liveSessionRes = await fetch(liveSessionCheckURL)
    const liveSessionData = await liveSessionRes.json()
    f1LiveSession = liveSessionData.liveSessionFound === true;
}

async function sendAnalytics() {
    let analyticsIDReturned;
    let analyticsSuccess = false;
    let userActiveSuccess = false;
    const userActiveBody = JSON.stringify({
        "userActive": "false"
    });
    const userActiveURL = APIURL + "/f1mv-lights-integration/analytics/useractive"
    const userActiveRes = await fetch(userActiveURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: userActiveBody
    });
    if (userActiveRes.status === 200) {
        userActiveSuccess = true;
    }
    if (analyticsPreference && !analyticsSent) {
        if(debugPreference){
            console.log("Sending analytics...");
        }
        const currentTime = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: "2-digit",
            hour12: false
        });
        const currentDate = new Date()
        const day = currentDate.getDate()
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()
        const date = day + "-" + month + "-" + year

        const config = userConfig.store;

        //remove personal data from config
        delete config.Settings.ikeaSettings.securityCode;
        delete config.Settings.hueSettings.token;
        for (const device of config.Settings.nanoLeafSettings.devices) {
            delete device.token;
        }

        const data = {
            "time_of_sending": currentTime,
            "date_of_sending": date,
            "config": config,
            "light_on_counter": lightsOnCounter,
            "light_off_counter": lightsOffCounter,
            "simulated_flag_counter": simulatedFlagCounter,
            "flag_switch_counter": flagSwitchCounter,
            "times_apis_are_checked": timesCheckAPIS,
            "times_f1mv_api_called": timesF1MVApiCalled,
            "dev_mode_was_activated": developerModeWasActivated
        }
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }
        const analyticsURL = APIURL + "/f1mv-lights-integration/analytics"
        const response = await fetch(analyticsURL, options); {
            const responseData = await response.json();
            if (debugPreference) {
                console.log(responseData);
            }
            if (response.status === 200) {
                analyticsSuccess = true;
                analyticsIDReturned = responseData.uniqueId;
                userConfig.set('latestAnalyticsID', analyticsIDReturned);
            } else {
                analyticsSuccess = false;
                if (debugPreference) {
                    console.log("Analytics failed to send with status code: " + response.status + " and error: " + responseData.error);
                }
            }
        }
        if(userActiveSuccess && analyticsSuccess){
            analyticsSent = true;
            console.log("All analytics are successfully sent!");
        }
    } else {
        if(debugPreference){
            console.log("Analytics are disabled or already sent!");
        }
    }
}

function reloadFromConfig(){
    win.webContents.send('log', "Reloading from config..");
    debugPreference = userConfig.get('Settings.advancedSettings.debugMode');
    f1mvURL = userConfig.get('Settings.MultiViewerForF1Settings.liveTimingURL') + '/api/graphql'
    f1mvCheckURL = userConfig.get('Settings.MultiViewerForF1Settings.liveTimingURL') + '/api/v1/live-timing/Heartbeat'
    ikeaDisabled = userConfig.get('Settings.ikeaSettings.ikeaDisable')
    goveeDisabled = userConfig.get('Settings.goveeSettings.goveeDisable')
    yeelightDisabled = userConfig.get('Settings.yeeLightSettings.yeeLightDisable')
    hueDisabled = userConfig.get('Settings.hueSettings.hueDisable')
    nanoLeafDisabled = userConfig.get('Settings.nanoLeafSettings.nanoLeafDisable')
    openRGBDisabled = userConfig.get('Settings.openRGBSettings.openRGBDisable')
    ikeaSecurityCode = userConfig.get('Settings.ikeaSettings.securityCode');
    analyticsPreference = userConfig.get('Settings.advancedSettings.analytics')
    userBrightness = parseInt(userConfig.get('Settings.generalSettings.defaultBrightness'))
    f1mvCheck = userConfig.get('Settings.MultiViewerForF1Settings.f1mvCheck')
    hideLogs = userConfig.get('Settings.generalSettings.hideLogs');
    greenColor = userConfig.get('Settings.generalSettings.colorSettings.green');
    yellowColor = userConfig.get('Settings.generalSettings.colorSettings.yellow');
    redColor = userConfig.get('Settings.generalSettings.colorSettings.red');
    safetyCarColor = userConfig.get('Settings.generalSettings.colorSettings.safetyCar');
    vscColor = userConfig.get('Settings.generalSettings.colorSettings.vsc');
    vscEndingColor = userConfig.get('Settings.generalSettings.colorSettings.vscEnding');
    autoOff = userConfig.get('Settings.generalSettings.autoTurnOffLights')
    nanoLeafDevices = userConfig.get('Settings.nanoLeafSettings.devices')
    ikeaDevices = userConfig.get('Settings.ikeaSettings.deviceIDs');
    yeelightIPs = userConfig.get('Settings.yeeLightSettings.deviceIPs');
    hueLightIDsList = userConfig.get('Settings.hueSettings.deviceIDs');
    openRGBPort = userConfig.get('Settings.openRGBSettings.openRGBServerPort');
    openRGBIP = userConfig.get('Settings.openRGBSettings.openRGBServerIP');
    streamDeckDisabled = userConfig.get('Settings.streamDeckSettings.streamDeckDisable');
    discordRPCDisabled = userConfig.get('Settings.discordSettings.discordRPCDisable');

    updateChannel = userConfig.get('Settings.advancedSettings.updateChannel')
    autoUpdater.channel = updateChannel;

    win.webContents.send('log', "Reloaded from config!");
    ikeaCheckSpectrum().then(r => {
        if (alwaysFalse) {
            console.log(r)
        }
    });
}


let updateFound = false;
autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    if (process.platform !== 'darwin') {
        const dialogOpts = {
            type: 'info',
            buttons: ['Restart', 'Later'],
            title: 'Application Update',
            message: process.platform === 'win32' ? releaseNotes : releaseName,
            detail: 'A new version has been downloaded. Restart the application to apply the updates.',
        }

        dialog.showMessageBox(dialogOpts).then((returnValue) => {
            if (returnValue.response === 0) autoUpdater.quitAndInstall()
        })
    }
})
autoUpdater.on('update-available', () => {
    updateFound = true;
    if (process.platform !== "darwin") {
        win.webContents.send('log', 'There is an update available. Downloading now... You will be notified when the update is ready to install.')
    } else if (process.platform === "darwin") {
        win.webContents.send('log', 'There is an update available. Unfortunately, auto-updating is not supported on macOS. Please download the latest version from GitHub.')
    }
})
autoUpdater.on('update-not-available', () => {
    if (!noUpdateFound) {
        win.webContents.send('log', 'There are no updates available.')
        noUpdateFound = true;
    }
})

autoUpdater.on('error', (message) => {
    console.error('There was a problem updating the application')
    console.error(message)
})

setInterval(() => {
    if (!updateFound) {
        autoUpdater.checkForUpdates().then(r => {
            if (alwaysFalse) {
                console.log(r);
            }
        });
    }
}, 30000)