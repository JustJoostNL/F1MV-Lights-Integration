'use strict';
const { app, dialog, ipcMain } = require('electron')
const BrowserWindow = require('electron').BrowserWindow
const electronLocalShortcut = require('electron-localshortcut');

const { autoUpdater } = require("electron-updater")
const process = require('process');
const configDefault = require("./config");
const Store = require('electron-store');
const {Bulb} = require("yeelight.io");
const userConfig = new Store({name: 'settings', defaults: configDefault});
let debugPreference = userConfig.get('Settings.advancedSettings.debugMode');
const f1mvURL = userConfig.get('Settings.MultiViewerForF1Settings.liveTimingURL')
const ikeaDisabled = userConfig.get('Settings.ikeaSettings.ikeaDisable')
const goveeDisabled = userConfig.get('Settings.goveeSettings.goveeDisable')
const yeelightDisabled = userConfig.get('Settings.yeeLightSettings.yeeLightDisable')

const analyticsPreference = userConfig.get('Settings.advancedSettings.analytics')
const analyticsURL = "https://api.joost.systems/f1mv-lights-integration/analytics"
let analyticsSent = false;

const updateChannel = userConfig.get('Settings.advancedSettings.updateChannel')
autoUpdater.channel = updateChannel;
const updateURL = "https://github.com/koningcool/F1MV-G-T-Y-Integration/releases/"

const userBrightness = parseInt(userConfig.get('Settings.generalSettings.defaultBrightness'))

let devMode = false;

let ikeaOnline = false;
let goveeOnline = false;

let TState;
let SState;
let TStateCheck;
let SStateCheck;
let win;
let f1mvCheck = true;
f1mvCheck = userConfig.get('devConfig.f1mvCheck')
let alwaysFalse = false;

let lightsOnCounter = 0;
let lightsOffCounter = 0;
let flagSwitchCounter = 0;
let simulatedFlagCounter = 0;
let timesF1MVApiCalled = 0;
let timesCheckAPIS = 0;
let developerModeWasActivated = false;
const fetch = require('node-fetch').default;

const greenColor = userConfig.get('Settings.generalSettings.colorSettings.green');
const yellowColor = userConfig.get('Settings.generalSettings.colorSettings.yellow');
const redColor = userConfig.get('Settings.generalSettings.colorSettings.red');
const safetyCarColor = userConfig.get('Settings.generalSettings.colorSettings.safetyCar');
const vscColor = userConfig.get('Settings.generalSettings.colorSettings.vsc');
const vscEndingColor = userConfig.get('Settings.generalSettings.colorSettings.vscEnding');

const Sentry = require("@sentry/electron");
Sentry.init({
    dsn: "https://e64c3ec745124566b849043192e58711@o4504289317879808.ingest.sentry.io/4504289338392576",
    release: "F1MV-G-T-Y-Integration@" + app.getVersion(),
    tracesSampleRate: 0.2,
});

function createWindow () {
    win = new BrowserWindow({
        width: 1500,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
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
        `).then(r => console.log(r));
    });

    win.loadFile('index.html').then(r => {
        if(debugPreference) {
            console.log(r)
        }
    })
}


app.whenReady().then(() => {
    createWindow()
    const { exec } = require('child_process');
    exec('node -v', (err) => {
        if (err) {
            // node is not installed
            dialog.showErrorBox("Node.js is not installed", "Node.js is not installed, please install Node.js to use this application. You can download Node.js from https://nodejs.org/en/download/")
            app.quit();
        } else {
            if(debugPreference) {
                console.log("Node.js is installed")
            }
        }
    });
    migrateConfig().then(r => {
        if(debugPreference) {
            console.log(r)
        }
    });

    electronLocalShortcut.register(win, 'shift+d', () => {
        if (!devMode) {
            devMode = true;
            developerModeWasActivated = true;
            userConfig.set('Settings.advancedSettings.debugMode', true);
            //debugPreference = true;
            win.webContents.send('dev', true);
            if (userConfig.get('devConfig.autoStartDevTools')) {
                win.webContents.openDevTools();
            }
            win.webContents.send('log', 'Developer Mode Activated!')
        }
        else if (devMode) {
            devMode = false;
            userConfig.set('Settings.advancedSettings.debugMode', false);
            //debugPreference = false;
            win.webContents.send('dev', false);
            win.webContents.closeDevTools()
            win.webContents.send('log', 'Developer Mode Deactivated!')
        }
    })

    const body = `"userActive": "true"`
    fetch("https://api.joost.systems/f1mv-lights-integration/analytics/useractive", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })

    autoUpdater.checkForUpdates().then(r => {
        if (debugPreference) {
            console.log(r)
        }
    })


    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }

    })
})

app.on('window-all-closed',  async() => {
    await sendAnalytics();
    if (process.platform !== 'darwin') {
        app.quit()
    }
})


ipcMain.on('open-config', () => {
    win.webContents.send('log', "Opening config file...");
    // open the config file (path is the variable userConfig.path), use the text editor that is default for the OS
    if(process.platform === 'win32') {
        require('child_process').exec('start notepad.exe ' + userConfig.path);
    } else if(process.platform === 'darwin') {
        require('child_process').exec('open -e ' + userConfig.path);
    } else if(process.platform === 'linux') {
        require('child_process').exec('open -e ' + userConfig.path);
    }
})

ipcMain.on('simulate', (event, arg) => {
    simulateFlag(arg).then(r => {
        if(debugPreference) {
            console.log(r)
            win.webContents.send('log', r);
        }
    })

})

ipcMain.on('toggle-devtools', () => {
    // check if dev tools are open
    if (win.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools()
    }
    else {
        win.webContents.openDevTools()
    }
})

ipcMain.on('toggle-debug', () => {
    if (debugPreference) {
        debugPreference = false;
        userConfig.set('Settings.advancedSettings.debugMode', false);
        win.webContents.send('log', 'Debug Mode Deactivated!')
    }
    else if (!debugPreference) {
        debugPreference = true;
        userConfig.set('Settings.advancedSettings.debugMode', true);
        win.webContents.send('log', 'Debug Mode Activated!')
    }
})

async function simulateFlag(arg) {
    if(arg === 'Green'){
        if(!goveeDisabled){
            await goveeControl(greenColor.r, greenColor.g, greenColor.b, userBrightness, "on");
        }
        if(!yeelightDisabled){
            await yeelightControl(greenColor.r, greenColor.g, greenColor.b, userBrightness, "on");
        }
        if(!ikeaDisabled){
            await ikeaControl(greenColor.r, greenColor.g, greenColor.b, userBrightness, "on");
        }
        simulatedFlagCounter++
    }
    if(arg === 'Red'){
        if(!goveeDisabled){
            await goveeControl(redColor.r, redColor.g, redColor.b, userBrightness, "on");
        }
        if(!yeelightDisabled){
            await yeelightControl(redColor.r, redColor.g, redColor.b, userBrightness, "on");
        }
        if(!ikeaDisabled){
            await ikeaControl(redColor.r, redColor.g, redColor.b, userBrightness, "on");
        }
        simulatedFlagCounter++
    }
    if(arg === 'Yellow'){
        if(!goveeDisabled){
            await goveeControl(yellowColor.r, yellowColor.g, yellowColor.b, userBrightness, "on");
        }
        if(!yeelightDisabled){
            await yeelightControl(yellowColor.r, yellowColor.g, yellowColor.b, userBrightness, "on");
        }
        if(!ikeaDisabled){
            await ikeaControl(yellowColor.r, yellowColor.g, yellowColor.b, userBrightness, "on");
        }
        simulatedFlagCounter++
    }
    if(arg === 'SC'){
        if(!goveeDisabled){
            await goveeControl(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, userBrightness, "on");
        }
        if(!yeelightDisabled){
            await yeelightControl(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, userBrightness, "on");
        }
        if(!ikeaDisabled){
            await ikeaControl(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, userBrightness, "on");
        }
        simulatedFlagCounter++
    }
    if(arg === 'VSC'){
        if(!goveeDisabled){
            await goveeControl(vscColor.r, vscColor.g, vscColor.b, userBrightness, "on");
        }
        if(!yeelightDisabled){
            await yeelightControl(vscColor.r, vscColor.g, vscColor.b, userBrightness, "on");
        }
        if(!ikeaDisabled){
            await ikeaControl(vscColor.r, vscColor.g, vscColor.b, userBrightness, "on");
        }
        simulatedFlagCounter++
    }
    if(arg === 'vscEnding'){
        if(!goveeDisabled){
            await goveeControl(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, userBrightness, "on");
        }
        if(!yeelightDisabled){
            await yeelightControl(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, userBrightness, "on");
        }
        if(!ikeaDisabled){
            await ikeaControl(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, userBrightness, "on");
        }
        simulatedFlagCounter++
    }
    if(arg === 'alloff'){
        if(!goveeDisabled){
            await goveeControl(0, 0, 0, 0, "off");
        }
        if(!yeelightDisabled){
            await yeelightControl(0, 0, 0, 0, "off");
        }
        if(!ikeaDisabled){
            await ikeaControl(0, 0, 0, 0, "off");
        }
        simulatedFlagCounter++
    }
    if(arg === 'alloff'){
        win.webContents.send('log', "Turned off all lights!")
    }
    else if(arg !== 'vscEnding'){
        win.webContents.send('log', "Simulated " + arg + "!")
    }
    if(arg === 'vscEnding'){
        win.webContents.send('log', "Simulated VSC Ending!")
    }
}

ipcMain.on('updatecheck', () => {
    console.log(autoUpdater.checkForUpdates())
    win.webContents.send('log', 'Checking for updates...')
})

ipcMain.on('test-button', async () => {
    console.log("Running action mapped on test button...")
    win.webContents.send('log', 'Running action mapped on test button...')
    // action here
})
ipcMain.on('ikea-get-ids', async () => {
    console.log("Getting Ikea Device IDs...")
    win.webContents.send('log', 'Getting Ikea Device IDs...')
    await ikeaControl(0, 255, 0, userBrightness, "getDevices");
})
ipcMain.on('send-analytics-button', async () => {
    console.log("Running send analytics code...")
    win.webContents.send('log', 'Running send analytics code...')
    await sendAnalytics();
})

ipcMain.on('f1mv-check', () => {
    if(f1mvCheck){
        f1mvCheck = false;
        userConfig.set('devConfig.f1mvCheck', false);
        win.webContents.send('log', 'Disabled F1MV Api check')
        console.log('Disabled F1MV api check!')
    }
    else if(!f1mvCheck){
        f1mvCheck = true;
        userConfig.set('devConfig.f1mvCheck', true);
        win.webContents.send('log', 'Enabled F1MV Api check')
        console.log('Enabled F1MV api check!')
    }
})
ipcMain.on('auto-devtools', () => {
    const autoDevTools = userConfig.get('devConfig.autoStartDevTools');
    if (autoDevTools) {
        userConfig.set('devConfig.autoStartDevTools', false);
        win.webContents.send('log', 'Disabled auto start dev tools')
        console.log('Disabled auto dev tools')
    }
    else if (!autoDevTools) {
        userConfig.set('devConfig.autoStartDevTools', true);
        win.webContents.send('log', 'Enabled auto start dev tools')
        console.log('Enabled auto dev tools')
    }
})
ipcMain.on('send-config', () => {
    console.log("Loading config file...")
    const config = userConfig.store;
    win.webContents.send('settings', config);
})
ipcMain.on('restart-app', (event, arg) => {
    fetch("http://localhost:9898/quit")
    app.relaunch();
    app.exit(0);
})

ipcMain.on('saveConfig', (event, arg) => {
    const defaultBrightness = arg.defaultBrightness;
    const autoTurnOffLights = arg.autoTurnOffLights
    const liveTimingURL =  arg.liveTimingURL
    const ikeaDisable = arg.ikeaDisable
    const secCode = arg.securityCode
    let deviceIDs = arg.deviceIDs
    const goveeDisable = arg.goveeDisable
    let goveeDisabledDevices = arg.devicesDisabledIPs
    const yeelightDisable = arg.yeeLightDisable
    let yeelightDeviceIPS =  arg.deviceIPs
    const updateChannel = arg.updateChannel
    const analyticsPref = arg.analytics
    const debugMode = arg.debugMode


    goveeDisabledDevices = goveeDisabledDevices.split(',');
    yeelightDeviceIPS = yeelightDeviceIPS.split(',');
    deviceIDs = deviceIDs.split(',');


    userConfig.set('Settings.generalSettings.defaultBrightness', parseInt(defaultBrightness));
    userConfig.set('Settings.generalSettings.autoTurnOffLights', autoTurnOffLights);
    userConfig.set('Settings.MultiViewerForF1Settings.liveTimingURL', liveTimingURL);
    userConfig.set('Settings.ikeaSettings.securityCode', secCode);
    userConfig.set('Settings.ikeaSettings.deviceIDs', deviceIDs);
    userConfig.set('Settings.ikeaSettings.ikeaDisable', ikeaDisable);
    userConfig.set('Settings.goveeSettings.goveeDisable', goveeDisable);
    userConfig.set('Settings.goveeSettings.devicesDisabledIPs', goveeDisabledDevices);
    userConfig.set('Settings.yeeLightSettings.yeeLightDisable', yeelightDisable);
    userConfig.set('Settings.yeeLightSettings.deviceIPs', yeelightDeviceIPS);
    userConfig.set('Settings.advancedSettings.updateChannel', updateChannel);
    userConfig.set('Settings.advancedSettings.analytics', analyticsPref);
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
    if (userConfig.get('version') !== 1) {
        console.log('Migrating config...')
        win.webContents.send('log', 'Migrating config...')
        // migrate the config
        const oldConfig = userConfig.store;
        console.log(oldConfig)
        const newConfig = {
            "Settings": {
                "generalSettings": {
                    "autoTurnOffLights": oldConfig.Settings.generalSettings.autoTurnOffLights,
                    "defaultBrightness": oldConfig.Settings.generalSettings.defaultBrightness,
                    "colorSettings":{
                        green: {
                            r: oldConfig.Settings.generalSettings.colorSettings.green.r,
                            g: oldConfig.Settings.generalSettings.colorSettings.green.g,
                            b: oldConfig.Settings.generalSettings.colorSettings.green.b
                        },
                        yellow: {
                            r: oldConfig.Settings.generalSettings.colorSettings.yellow.r,
                            g: oldConfig.Settings.generalSettings.colorSettings.yellow.g,
                            b: oldConfig.Settings.generalSettings.colorSettings.yellow.b
                        },
                        red: {
                            r: oldConfig.Settings.generalSettings.colorSettings.red.r,
                            g: oldConfig.Settings.generalSettings.colorSettings.red.g,
                            b: oldConfig.Settings.generalSettings.colorSettings.red.b
                        },
                        safetyCar: {
                            r: oldConfig.Settings.generalSettings.colorSettings.safetyCar.r,
                            g: oldConfig.Settings.generalSettings.colorSettings.safetyCar.g,
                            b: oldConfig.Settings.generalSettings.colorSettings.safetyCar.b
                        },
                        vsc: {
                            r: oldConfig.Settings.generalSettings.colorSettings.vsc.r,
                            g: oldConfig.Settings.generalSettings.colorSettings.vsc.g,
                            b: oldConfig.Settings.generalSettings.colorSettings.vsc.b
                        },
                        vscEnding: {
                            r: oldConfig.Settings.generalSettings.colorSettings.vscEnding.r,
                            g: oldConfig.Settings.generalSettings.colorSettings.vscEnding.g,
                            b: oldConfig.Settings.generalSettings.colorSettings.vscEnding.b

                        }
                    }
                },
                "MultiViewerForF1Settings": {
                    "liveTimingURL": oldConfig.Settings.MultiViewerForF1Settings.liveTimingURL
                },
                "ikeaSettings": {
                    "ikeaDisable": oldConfig.Settings.ikeaSettings.ikeaDisable,
                    "securityCode": oldConfig.Settings.ikeaSettings.securityCode,
                    "deviceIDs": oldConfig.Settings.ikeaSettings.deviceIDs
                },
                "goveeSettings": {
                    "goveeDisable": oldConfig.Settings.goveeSettings.goveeDisable,
                    "devicesDisabledIPs": oldConfig.Settings.goveeSettings.devicesDisabledIPs
                },
                "yeeLightSettings": {
                    "yeeLightDisable": oldConfig.Settings.yeeLightSettings.yeeLightDisable,
                    "deviceIPs": oldConfig.Settings.yeeLightSettings.deviceIPs
                },
                "advancedSettings": {
                    "debugMode": oldConfig.Settings.advancedSettings.debugMode,
                    "updateChannel": oldConfig.Settings.advancedSettings.updateChannel,
                    "analytics": oldConfig.Settings.advancedSettings.analytics
                }
            },
            "version": 1
        }
        userConfig.clear();
        userConfig.set(newConfig);
        console.log('Config migrated!')
        win.webContents.send('log', 'Config migrated!')
    }
}
async function f1mvAPICall() {
    if(f1mvCheck) {
        try {
            timesF1MVApiCalled++
            const response = await fetch(f1mvURL, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    'query': 'query {\n  liveTimingState {\n    SessionStatus\n TrackStatus\n  }\n}'
                })
            });
            if (response.status === 200) {
                const responseData = await response.json();
                const sessionStatusData = responseData.data.liveTimingState.SessionStatus.Status;
                TState = responseData.data.liveTimingState.TrackStatus.Status
                SState = sessionStatusData
            }
        } catch (e) {
            console.log("Failed to get the data from the F1MV API: " + e);
            win.webContents.send('log', "Failed to get the data from the F1MV API: " + e);
        }
    }
}

async function f1mvLightSync(){
    if (TStateCheck !== TState && SState !== "Ends" && SState !== "Finalised"){
        flagSwitchCounter++
        switch(TState){
            case "1":
                console.log("Green flag!")
                win.webContents.send('log', "Green flag!")
                if(!goveeDisabled) {
                    await goveeControl(greenColor.r, greenColor.g, greenColor.b, userBrightness, "on")
                }
                if(!yeelightDisabled) {
                    await yeelightControl(greenColor.r, greenColor.g, greenColor.b, userBrightness, "on")
                }
                if(!ikeaDisabled) {
                    await ikeaControl(greenColor.r, greenColor.g, greenColor.b, userBrightness, "on")
                }
                TStateCheck = TState
                break;
            case "2":
                console.log("Yellow flag!")
                win.webContents.send('log', "Yellow flag!")
                if(!goveeDisabled) {
                    await goveeControl(yellowColor.r, yellowColor.g, yellowColor.b, userBrightness, "on")
                }
                if(!yeelightDisabled) {
                    await yeelightControl(yellowColor.r, yellowColor.g, yellowColor.b, userBrightness, "on")
                }
                if(!ikeaDisabled) {
                    await ikeaControl(yellowColor.r, yellowColor.g, yellowColor.b, userBrightness, "on")
                }
                TStateCheck = TState
                break;
            case "4":
                console.log("Safety car!")
                win.webContents.send('log', "Safety car!")
                if(!goveeDisabled) {
                    await goveeControl(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, userBrightness, "on")
                }
                if(!yeelightDisabled) {
                    await yeelightControl(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, userBrightness, "on")
                }
                if(!ikeaDisabled) {
                    await ikeaControl(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, userBrightness, "on")
                }
                TStateCheck = TState
                break;
            case "5":
                console.log("Red flag!")
                win.webContents.send('log', "Red flag!")
                if(!goveeDisabled) {
                    await goveeControl(redColor.r, redColor.g, redColor.b, userBrightness, "on")
                }
                if(!yeelightDisabled) {
                    await yeelightControl(redColor.r, redColor.g, redColor.b, userBrightness, "on")
                }
                if(!ikeaDisabled) {
                    await ikeaControl(redColor.r, redColor.g, redColor.b, userBrightness, "on")
                }
                TStateCheck = TState
                break;
            case "6":
                console.log("Virtual safety car!")
                win.webContents.send('log', "Virtual safety car!")
                if(!goveeDisabled) {
                    await goveeControl(vscColor.r, vscColor.g, vscColor.b, userBrightness, "on")
                }
                if(!yeelightDisabled) {
                    await yeelightControl(vscColor.r, vscColor.g, vscColor.b, userBrightness, "on")
                }
                if(!ikeaDisabled) {
                    await ikeaControl(vscColor.r, vscColor.g, vscColor.b, userBrightness, "on")
                }
                TStateCheck = TState
                break;
            case "7":
                console.log("VSC Ending")
                win.webContents.send('log', "VSC Ending")
                if(!goveeDisabled) {
                    await goveeControl(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, userBrightness, "on")
                }
                if(!yeelightDisabled) {
                    await yeelightControl(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, userBrightness, "on")
                }
                if(!ikeaDisabled) {
                    await ikeaControl(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, userBrightness, "on")
                }
                TStateCheck = TState
                break;
        }
    }
    else if (SState === "Ends" || SState === "Finalised" && SStateCheck !== SState){
        const autoOff = userConfig.get('Settings.generalSettings.autoTurnOffLights')
        if(autoOff){
            console.log("Session ended, turning off lights...")
            win.webContents.send('log', "Session ended, turning off lights...")
            if(!goveeDisabled) {
                await goveeControl(0, 255, 0, userBrightness, "off")
            }
            if(!yeelightDisabled) {
                await yeelightControl(0, 255, 0, userBrightness, "off")
            }
            if(!ikeaDisabled) {
                await ikeaControl(0, 255, 0, userBrightness, "off")
            }
            SStateCheck = SState
        }
    }
}

setInterval(function() {
    if(f1mvCheck) {
        f1mvAPICall().then(r => {
            if (alwaysFalse) {
                console.log(r)
            }
        });
        f1mvLightSync().then(r => {
            if (alwaysFalse) {
                console.log(r)
            }
        });
    }
}, 100);

setInterval(function() {
    checkApis()
}, 3000);

setTimeout(function() {
    checkApis()
}, 1500);

setTimeout(function() {
    if(!ikeaDisabled) {
        ikeaInitialize().then(r => {
            if(debugPreference) {
                console.log(r)
            }
        });
    }
    if(!goveeDisabled) {
        goveeInitialize().then(r => {
            if(debugPreference) {
                console.log(r)
            }
        });
    }
}, 500);

setTimeout(function() {
    setInterval(function() {
    if(ikeaOnline) {
        win.webContents.send('ikeaAPI', 'online');
    } else if(ikeaOnline === false) {
        win.webContents.send('ikeaAPI', 'offline');
    }
    if(goveeOnline) {
        win.webContents.send('goveeAPI', 'online');
    } else if(goveeOnline === false) {
        win.webContents.send('goveeAPI', 'offline');
    }
    }, 1500);
}, 900);


async function goveeControl(r, g, b, brightness, action){
    const Govee = require("govee-lan-control");
    const govee = new Govee.default();

    let allDevices = govee.devicesArray;
    // TODO: Fix this
    const disabledDevices = userConfig.get('Settings.goveeSettings.devicesDisabledIPs');
    if(disabledDevices > 0) {
        allDevices = govee.devicesArray.filter(device => device.ip !== disabledDevices);
    }
    allDevices.forEach(device => {
        if(debugPreference) {
            console.log("Device selected: " + device.model);
            win.webContents.send('log', "Device selected: " + device.model);
        }
        if(action === "on"){
            lightsOnCounter++
            if(debugPreference) {
                console.log("Turning on the light with given options (when available)...");
                win.webContents.send('log', "Turning on the light with given options (when available)...");
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
            if(device.state.isOn === 0){
                device.actions.setOn();
            }
        }
        if(action === "off"){
            lightsOffCounter++
            if(debugPreference) {
                console.log("Turning off the light...");
            }
            device.actions.setOff();
        }
        if(action === "getState"){
            if(debugPreference) {
                console.log("Getting the state of the light...");
            }
            if(device.state.isOn === 1){
                console.log("The light is on");
            } else {
                console.log("The light is off");
            }
            console.log("The brightness is: " + device.state.brightness);
            console.log("The color is: " + device.state.color);
        }
    });
}

async function goveeInitialize(){
    const Govee = require("govee-lan-control");
    const govee = new Govee.default();

    goveeOnline = true;

    govee.on("ready", () => {
        if(debugPreference) {
            console.log("Connected to the local Govee API");
            win.webContents.send('log', "Connected to the local Govee API");
        }
    });
    govee.on("deviceAdded", (device) => {
        if(debugPreference) {
            console.log("New device added: " + device.model);
            win.webContents.send('log', "New device added: " + device.model);
        }

    });
}
async function ikeaInitialize(){
    const { exec } = require('child_process');
    if(debugPreference) {
        console.log("Initializing IKEA Tradfri...");
        win.webContents.send('log', "Initializing IKEA Tradfri...");
    }
    const securityCode = userConfig.get('Settings.ikeaSettings.securityCode');
    let debug;
    if (debugPreference) {
        debug = "--debug";
    } else {
        debug = "";
    }
    let startPath = app.getAppPath();
    startPath = startPath + "\\ikea.js"
    const startCommand = 'node ' + startPath + ' ' +  '--' + securityCode + ' ' + debug;
    let child;
    child = exec(startCommand, (err) => {
        if (err) {
            console.log("Failed to start the IKEA Tradfri plugin: " + err);
            win.webContents.send('log', "Failed to start the IKEA Tradfri plugin: " + err);
            return;
        }
        if(debugPreference) {
            console.log("IKEA Tradfri server started");
            win.webContents.send('log', "IKEA Tradfri server started");
        }
    });
    ikeaOnline = true;
    child.stdout.on('data', (data) => {
        console.log(data);
        win.webContents.send('log', data);
    });
    child.stderr.on('data', (data) => {
        console.log(data);
        win.webContents.send('log', data);

    });
    // make sure to kill the child process when the app is closed
    app.on('window-all-closed', () => {
        fetch('http://localhost:9898/quit');
    });

}

async function ikeaControl(r, g , b, brightness, action) {
    const devices = userConfig.get('Settings.ikeaSettings.deviceIDs');
    let colorDevices = [];
    let whiteDevices = [];
    for (let i = 0; i < devices.length; i++) {
        const response = await fetch('http://localhost:9898/getSpectrum/' + devices[i]);
        const json = await response.json();
        if (json.spectrum === "rgb") {
            colorDevices.push(devices[i]);
        } else {
            whiteDevices.push(devices[i]);
        }
    }

    const fs = require('fs');
    if (action === "getDevices") {
        // send a request to localhost:9898/getDevices, then create a html file with a table of all the devices with there names, ids, state, and spectrum, make sure the html is beautified and has a nice design, after that all, open the html in a new electron window
        const response = await fetch('http://localhost:9898/getDevices');
        const json = await response.json();
        // create the html file, make sure it is dark mode
        let html = "<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'><title>Devices</title><link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css'><script src='https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js'></script><script src='https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js'></script><script src='https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js'></script></head><body><div class='container'><table class='table table-dark table-striped'><thead><tr><th>Device Name</th><th>Device ID</th><th>Device Is On</th><th>Color support</th></tr></thead><tbody>";
        json.forEach(device => {
            html = html + "<tr><td>" + device.name + "</td><td>" + device.id + "</td><td>" + device.state + "</td><td>" + device.spectrum + "</td></tr>";
        });
        html = html + "</tbody></table></div></body></html>";
        const savePath = app.getAppPath() + "\\devices.html";
        fs.writeFile(savePath, html, function (err) {
            if (err) throw err;
            console.log('Saved!');
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
    if (action === "on") {
        let hue;
        if (debugPreference) {
            console.log("Turning on the light with the given options...");
        }


        if(r === 0 && g === 255 && b === 0){
            hue = 120;
        }
        if(r === 255 && g === 255 && b === 0){
            hue = 50;
        }
        if(r === 255 && g === 0 && b === 0){
            hue = 0;
        }
        // for each color device, send a request to localhost:9898/setHue?deviceID=DEVICEID&state=HUEVALUE
        colorDevices.forEach(device => {
            device = parseInt(device);
            fetch('http://localhost:9898/setHue?deviceId=' + device + '&state=' + hue);
        });
        colorDevices.forEach(device => {
            device = parseInt(device);
            fetch('http://localhost:9898/toggleDevice?deviceId=' + device + '&state=on');
            fetch('http://localhost:9898/setBrightness?deviceId=' + device + '&state=' + brightness);
        });
        whiteDevices.forEach(device => {
            device = parseInt(device);
            if(hue === 50) {
                fetch('http://localhost:9898/toggleDevice?deviceId=' + device + '&state=on');
            } else if(hue === 0){
                fetch('http://localhost:9898/toggleDevice?deviceId=' + device + '&state=on');
            }
            else if(hue === 120){
                fetch('http://localhost:9898/toggleDevice?deviceId=' + device + '&state=off');
            }
        });

    }
    if (action === "off") {
        colorDevices.forEach(device => {
            device = parseInt(device);
            fetch('http://localhost:9898/toggleDevice?deviceId=' + device + '&state=off');
        });
        whiteDevices.forEach(device => {
            device = parseInt(device);
            fetch('http://localhost:9898/toggleDevice?deviceId=' + device + '&state=off');
        });
    }
}

async function yeelightControl(r, g, b, brightness, action) {
    if(!yeelightDisabled) {
        const yeelightIPs = userConfig.get('Settings.yeeLightSettings.deviceIPs');

        yeelightIPs.forEach((light) => {
            const bulb = new Bulb(light);
            if(debugPreference) {
                console.log("Turning on light: " + light + " with brightness: " + brightness + " and color: " + r + " " + g + " " + b);
                win.webContents.send('log', "Turning on light: " + light + " with brightness: " + brightness + " and color: " + r + " " + g + " " + b);
            }
            bulb.on('connected', (lamp) => {
                try {
                    if(action === "on") {
                        lightsOnCounter++
                        lamp.color(r, g, b);
                        lamp.brightness(brightness);
                        lamp.onn();
                        lamp.disconnect();
                    }
                    if(action === "off") {
                        lightsOffCounter++
                        lamp.off();
                        lamp.disconnect();
                    }
                } catch (err) {
                    if(debugPreference) {
                        console.log(err)
                        win.webContents.send('log', err);
                    }
                }
            });
            bulb.on('error', (err) => {
                if(debugPreference) {
                    console.log(err)
                    win.webContents.send('log', err);
                }
            });
            bulb.connect();
        });
    }
}
function checkApis() {
    timesCheckAPIS++
    const yeelightIPs = userConfig.get('Settings.yeeLightSettings.deviceIPs');
    fetch(updateURL)
        .then(function () {
            win.webContents.send('updateAPI', 'online')
        })
        .catch(function () {
            win.webContents.send('updateAPI', 'offline')
        });

    fetch(f1mvURL)
        .then(function () {
            win.webContents.send('f1mvAPI', 'online')
        })
        .catch(function () {
            win.webContents.send('f1mvAPI', 'offline')
        });

    const f1tvURL = "https://f1tv.formula1.com/1.0/R/ENG/WEB_DASH/ALL/EVENTS/LIVENOW/F1_TV_Pro_Annual/2";
    //send a fetch request to the f1tv api and check in the json for resultObj.items and if it is empty then the api is offline
    fetch(f1tvURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data.resultObj.items.length === 0) {
                win.webContents.send('f1tvAPI', 'offline')
                if(debugPreference) {
                    console.log("No live session detected!");
                }

            } else {
                win.webContents.send('f1tvAPI', 'online')
                if(debugPreference) {
                    console.log("Live session detected, API returned: " + data.resultObj.items);
                }
            }
        })
        .catch(function () {
            win.webContents.send('f1tvAPI', 'offline')
        });
}

async function sendAnalytics() {
    if(analyticsPreference && !analyticsSent) {
        console.log("Sending analytics...");
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: "2-digit", hour12: false });
        const currentDate = new Date()
        const day = currentDate.getDate()
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()
        const date = day + "-" + month + "-" + year

        const analyticsURLV2 = "https://api.joost.systems/f1mv-lights-integration/analytics/pretty"

        const config = userConfig.store;

        //remove personal data from config
        delete config.Settings.ikeaSettings.securityCode;

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
        const dataV2 = {
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
        const optionsV2 = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataV2)
        }
        let resv1;
        let resv2;
        const responseV2 = await fetch(analyticsURLV2, optionsV2);{
            if(responseV2.status === 200) {
                resv2 = true;
            } else {
                console.log("Analytics failed to send, status code: " + responseV2.status);
            }
        }
        const response = await fetch(analyticsURL, options); {
            const responseData = await response.json();
            if(debugPreference){
                console.log(responseData);
            }
            if(response.status === 200){
                resv1 = true;
            }
        }
        if(resv1 && resv2) {
            console.log("Analytics sent successfully!");
            analyticsSent = true;
        }
        const body = `"userActive": "false"`
        await fetch("https://api.joost.systems/f1mv-lights-integration/analytics/useractive", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        analyticsSent = true;
    }
}



autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail:
            'A new version has been downloaded. Restart the application to apply the updates.',
    }

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall()
    })
})
autoUpdater.on('update-available', () => {
    console.log("There is an update available. Downloading now... You will be notified when the update is ready to install.")
    win.webContents.send('log', 'There is an update available. Downloading now... You will be notified when the update is ready to install.')
})

autoUpdater.on('error', (message) => {
    console.error('There was a problem updating the application')
    console.error(message)
})

setInterval(() => {
    autoUpdater.checkForUpdates().then(r => console.log(r) && win.webContents.send('log', r)).catch(e => console.log(e) && win.webContents.send('log', e))
}, 60000)