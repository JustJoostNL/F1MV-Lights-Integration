'use strict';
const { app, BrowserWindow, dialog, ipcMain, globalShortcut } = require('electron')

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

let devMode = false;

let TState;
let SState;
let TStateCheck;
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

const Sentry = require("@sentry/electron");
require("govee-lan-control");
require("fs");
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

    // register the keyboard shortcut shift+d
    globalShortcut.register('shift+d', () => {
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
    require('child_process').exec('start notepad.exe ' + userConfig.path);
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
            await goveeControl(0, 255, 0, 100, "on");
        }
        if(!yeelightDisabled){
            await yeelightControl(0, 255, 0, 100, "on");
        }
        if(!ikeaDisabled){
            await ikeaControl(0, 255, 0, 100, "on");
        }
        simulatedFlagCounter++
    }
    if(arg === 'Red'){
        if(!goveeDisabled){
            await goveeControl(255, 0, 0, 100, "on");
        }
        if(!yeelightDisabled){
            await yeelightControl(255, 0, 0, 100, "on");
        }
        if(!ikeaDisabled){
            await ikeaControl(255, 0, 0, 100, "on");
        }
        simulatedFlagCounter++
    }
    if(arg === 'SC' || arg === 'VSC' || arg === 'vscEnding' || arg === 'Yellow'){
        if(!goveeDisabled){
            await goveeControl(255, 255, 0, 100, "on");
        }
        if(!yeelightDisabled){
            await yeelightControl(255, 255, 0, 100, "on");
        }
        if(!ikeaDisabled){
            await ikeaControl(255, 255, 0, 100, "on");
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
    win.webContents.send('log', "Simulated " + arg + "!");
    console.log(arg)
}

ipcMain.on('updatecheck', () => {
    console.log(autoUpdater.checkForUpdates())
    win.webContents.send('log', 'Checking for updates...')
})

ipcMain.on('test-button', async () => {
    console.log("Running action mapped on test button...")
    win.webContents.send('log', 'Running action mapped on test button...')
    await ikeaControl(0, 255, 0, 100, "getDevices");
})
ipcMain.on('ikea-get-ids', async () => {
    console.log("Getting Ikea Device IDs...")
    win.webContents.send('log', 'Getting Ikea Device IDs...')
    await ikeaControl(0, 255, 0, 100, "getDevices");
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
                    await goveeControl(0, 255, 0, 100, "on")
                }
                if(!yeelightDisabled) {
                    await yeelightControl(0, 255, 0, 100, "on")
                }
                if(!ikeaDisabled) {
                    await ikeaControl(0, 255, 0, 100, "on")
                }
                TStateCheck = TState
                break;
            case "2":
                console.log("Yellow flag!")
                win.webContents.send('log', "Yellow flag!")
                if(!goveeDisabled) {
                    await goveeControl(255, 255, 0, 100, "on")
                }
                if(!yeelightDisabled) {
                    await yeelightControl(255, 255, 0, 100, "on")
                }
                if(!ikeaDisabled) {
                    await ikeaControl(255, 255, 0, 100, "on")
                }
                TStateCheck = TState
                break;
            case "4":
                console.log("Safety car!")
                win.webContents.send('log', "Safety car!")
                if(!goveeDisabled) {
                    await goveeControl(255, 255, 255, 100, "on")
                }
                if(!yeelightDisabled) {
                    await yeelightControl(255, 255, 255, 100, "on")
                }
                if(!ikeaDisabled) {
                    await ikeaControl(255, 255, 255, 100, "on")
                }
                TStateCheck = TState
                break;
            case "5":
                console.log("Red flag!")
                win.webContents.send('log', "Red flag!")
                if(!goveeDisabled) {
                    await goveeControl(255, 0, 0, 100, "on")
                }
                if(!yeelightDisabled) {
                    await yeelightControl(255, 0, 0, 100, "on")
                }
                if(!ikeaDisabled) {
                    await ikeaControl(255, 0, 0, 100, "on")
                }
                TStateCheck = TState
                break;
            case "6":
                console.log("Virtual safety car!")
                win.webContents.send('log', "Virtual safety car!")
                if(!goveeDisabled) {
                    await goveeControl(255, 255, 255, 100, "on")
                }
                if(!yeelightDisabled) {
                    await yeelightControl(255, 255, 255, 100, "on")
                }
                if(!ikeaDisabled) {
                    await ikeaControl(255, 255, 255, 100, "on")
                }
                TStateCheck = TState
                break;
            case "7":
                console.log("VSC Ending")
                win.webContents.send('log', "VSC Ending")
                if(!goveeDisabled) {
                    await goveeControl(255, 255, 255, 100, "on")
                }
                if(!yeelightDisabled) {
                    await yeelightControl(255, 255, 255, 100, "on")
                }
                if(!ikeaDisabled) {
                    await ikeaControl(255, 255, 255, 100, "on")
                }
                TStateCheck = TState
                break;
        }
    }
    else if (SState === "Ends" || SState === "Finalised"){
        const autoOff = userConfig.get('config.autoTurnOffLights')
        if(autoOff){
            console.log("Session ended, turning off lights...")
            win.webContents.send('log', "Session ended, turning off lights...")
            if(!goveeDisabled) {
                await goveeControl(0, 255, 0, 100, "off")
            }
            if(!yeelightDisabled) {
                await yeelightControl(0, 255, 0, 100, "off")
            }
            if(!ikeaDisabled) {
                await ikeaControl(0, 255, 0, 100, "off")
            }
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
}, 900);

setTimeout(function() {
    console.log("Ikea Disabled: " + ikeaDisabled);
    win.webContents.send('log', "Ikea Disabled: " + ikeaDisabled);
    console.log("Govee Disabled: " + goveeDisabled);
    win.webContents.send('log', "Govee Disabled: " + goveeDisabled);
    console.log("Yeelight Disabled: " + yeelightDisabled);
    win.webContents.send('log', "Yeelight Disabled: " + yeelightDisabled);
    if(debugPreference) {
        console.log("F1MV Api Disabled: " + !f1mvCheck);
        win.webContents.send('log', "F1MV Api Disabled: " + !f1mvCheck);
    }
    if(!goveeDisabled) {
        goveeInitialize().then(r => {
            if(debugPreference) {
                console.log(r)
            }
        });
    }
    if(!ikeaDisabled) {
        ikeaInitialize().then(r => {
            if(debugPreference) {
                console.log(r)
            }
        });
    }
}, 300);


async function goveeControl(r, g, b, brightness, action){
    const Govee = require("govee-lan-control");
    const govee = new Govee.default();

    if(debugPreference){
        console.log("Connecting to the Govee Lan API...");
        win.webContents.send('log', "Connecting to the Govee Lan API...");
    }
    let allDevices = govee.devicesArray;
    const disabledDevices = userConfig.get('Settings.goveeSettings.devicesDisabledIPS');
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

    console.log("Connecting to the local Govee API...");

    govee.on("ready", () => {
        console.log("Server/client is ready!");
    });

    govee.on("deviceAdded", (device) => {
        console.log("Govee device found: " + device.model);

    });
}
async function ikeaInitialize(){
    const { exec } = require('child_process');
    console.log("Starting the IKEA Tradfri Server...");
    win.webContents.send('log', "Starting the IKEA Tradfri Server...");
    const securityCode = userConfig.get('Settings.ikeaSettings.securityCode');
    let debug;
    if (debugPreference) {
        debug = "--debug";
    } else {
        debug = "";
    }
    const startCommandDev = 'node ikea.js --' + securityCode + ' ' + debug;
    let startPath = app.getAppPath();
    startPath = startPath + "\\ikea.js"
    const startCommand = 'node ' + startPath + ' ' +  '--' + securityCode + ' ' + debug;
    const tradfriDev = userConfig.get('devConfig.tradfriDev');
    let child;
    if (tradfriDev){
        child = exec(startCommandDev, (err) => {
            if (err) {
                console.log("Failed to start the IKEA Tradfri plugin: " + err);
                win.webContents.send('log', "Failed to start the IKEA Tradfri plugin: " + err);
                return;
            }
            console.log("Started the IKEA Tradfri plugin");
            win.webContents.send('log', "Started the IKEA Tradfri plugin");
        });
    } else if(!tradfriDev){
        child = exec(startCommand, (err) => {
            if (err) {
                console.log("Failed to start the IKEA Tradfri plugin: " + err);
                win.webContents.send('log', "Failed to start the IKEA Tradfri plugin: " + err);
                return;
            }
            console.log("Started the IKEA Tradfri plugin");
            win.webContents.send('log', "Started the IKEA Tradfri plugin");
        });
    }
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
    const fs = require('fs');
    if (action === "getDevices") {
        // send a request to localhost:9898/getDevices, then create a html file with a table of all the devices with there names and ids, make sure the html is beautified and has a nice design, after that all, open the html in a new electron window
        const response = await fetch('http://localhost:9898/getDevices');
        const json = await response.json();
        // create the html file, make sure it is dark mode
        let html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Devices</title><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.9.0/css/bulma.min.css"></head><body><div class="container"><table class="table is-fullwidth is-hoverable"><thead><tr><th>Device Name</th><th>Device ID</th></tr></thead><tbody>';
        json.forEach(device => {
            html += '<tr><td>' + device.name + '</td><td>' + device.id + '</td></tr>';
        });
        html += '</tbody></table></div></body></html>';
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
        let colorDevices = userConfig.get('Settings.ikeaSettings.colorDevices');
        let whiteDevices = userConfig.get('Settings.ikeaSettings.whiteDevices');

        if(r === 0 && g === 255 && b === 0){
            hue = 120;
        }
        if(r === 255 && g === 255 && b === 0){
            hue = 45;
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
            if(hue === 45) {
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
        let colorDevices = userConfig.get('Settings.ikeaSettings.colorDevices');
        let whiteDevices = userConfig.get('Settings.ikeaSettings.whiteDevices');
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
    const goveeURL = "https://developer-api.govee.com/v1/devices";
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

    fetch(goveeURL)
        .then(function () {
            win.webContents.send('goveeAPI', 'online')
        })
        .catch(function () {
            win.webContents.send('goveeAPI', 'offline')
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


    yeelightIPs.forEach((light) => {
        const bulb = new Bulb(light);
        bulb.on('connected', (lamp) => {
            win.webContents.send('lightAPI', {status: 'online', ip: light});
            lamp.disconnect();
        });
        bulb.on('error', () => {
            win.webContents.send('lightAPI', {status: 'offline', ip: light});
        });
        bulb.connect();
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
        //replace the api keys in the config with "hidden" so it doesn't get sent to the analytics server
        delete config.Settings.goveeSettings.apiKey;

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