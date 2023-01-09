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
let debugPreference = userConfig.get('Settings.advancedSettings.debugMode');
let f1mvURL = userConfig.get('Settings.MultiViewerForF1Settings.liveTimingURL') + '/api/graphql'
let f1mvCheckURL = userConfig.get('Settings.MultiViewerForF1Settings.liveTimingURL') + '/api/v1/live-timing/Heartbeat'
let ikeaDisabled = userConfig.get('Settings.ikeaSettings.ikeaDisable')
let goveeDisabled = userConfig.get('Settings.goveeSettings.goveeDisable')
let yeelightDisabled = userConfig.get('Settings.yeeLightSettings.yeeLightDisable')
let hueDisabled = userConfig.get('Settings.hueSettings.hueDisable')
let nanoLeafDisabled = userConfig.get('Settings.nanoLeafSettings.nanoLeafDisable')
let openRGBDisabled = userConfig.get('Settings.openRGBSettings.openRGBDisable')

let ikeaSecurityCode = userConfig.get('Settings.ikeaSettings.securityCode');

const Govee = require("govee-lan-control");
const govee = new Govee.default();


let analyticsPreference = userConfig.get('Settings.advancedSettings.analytics')
const APIURL = "https://api.joost.systems/api/v2"
let analyticsSent = false;

const updateChannel = userConfig.get('Settings.advancedSettings.updateChannel')
autoUpdater.channel = updateChannel;
const updateURL = "https://api.joost.systems/github/repos/JustJoostNL/f1mv-lights-integration/releases"

let userBrightness = parseInt(userConfig.get('Settings.generalSettings.defaultBrightness'))

let devMode = false;

let configHasBeenReloadedIkeaCheck = false;

let ikeaOnline = false;
let goveeOnline = false;
let hueOnline = false;
let nanoLeafOnline = false;
let openRGBOnline = false;

let f1LiveSession = false;
let f1mvAPIOnline = false;
let updateAPIOnline = false;

let colorDevices = [];
let whiteDevices = [];
let devicesDone = [];

let TState;
let SState;
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

let noUpdateFound = false;

const {
    spawn
} = require('child_process');

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
    const {
        exec
    } = require('child_process');
    if(process.platform === win) {
        exec('node -v', (err) => {
            if (err) {
                // node is not installed
                dialog.showMessageBox(win, {
                    type: "error",
                    title: "Node JS is not installed",
                    message: "Node JS is not installed, please install Node JS to continue, if you are not going to use the Ikea integration, you can continue without installing Node JS",
                    buttons: ["Exit", "Proceed"],
                    defaultId: 0,
                    cancelId: 0
                }).then(result => {
                    if (result.response === 0) {
                        app.quit();
                    } else {

                    }
                })
            } else {
                // node is installed
                if (debugPreference) {
                    console.log("Node JS is installed")
                }
            }
        });
    }
    else if (process.platform === "darwin" || process.platform === "linux") {
        const child = spawn('node', ['-v']);
        child.on('error', () => {
            // node is not installed
            dialog.showMessageBox(win, {
                type: "error",
                title: "Node JS is not installed",
                message: "Node JS is not installed, please install Node JS to continue, if you are not going to use the Ikea integration, you can continue without installing Node JS",
                buttons: ["Exit", "Proceed"],
                defaultId: 0,
                cancelId: 0
            }).then(result => {
                if (result.response === 0) {
                    app.quit();
                } else {

                }
            })
        });
        child.on('exit', () => {
            if (debugPreference) {
                console.log("Node JS is installed")
            }
        });
    }
    migrateConfig().then(r => {
        if (debugPreference) {
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
        } else if (devMode) {
            devMode = false;
            userConfig.set('Settings.advancedSettings.debugMode', false);
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

app.on('window-all-closed', async () => {
    await sendAnalytics();
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

function toggleInit(){
    if(hideLogs){
        win.webContents.send('hide-logs', true);
    } else if (!hideLogs){
        win.webContents.send('hide-logs', false);
    }
}

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
        if (!goveeDisabled) {
            await goveeControl(greenColor.r, greenColor.g, greenColor.b, userBrightness, "on");
        }
        if (!yeelightDisabled) {
            await yeelightControl(greenColor.r, greenColor.g, greenColor.b, userBrightness, "on");
        }
        if (!ikeaDisabled) {
            await ikeaControl(greenColor.r, greenColor.g, greenColor.b, userBrightness, "on", "green");
        }
        if (!hueDisabled) {
            await hueControl(greenColor.r, greenColor.g, greenColor.b, userBrightness, "on");
        }
        if (!nanoLeafDisabled) {
            await nanoLeafControl(greenColor.r, greenColor.g, greenColor.b, userBrightness, "on");
        }
        if (!openRGBDisabled) {
            await openRGBControl(greenColor.r, greenColor.g, greenColor.b, userBrightness, "on");
        }
        simulatedFlagCounter++
    }
    if (arg === 'Red') {
        if (!goveeDisabled) {
            await goveeControl(redColor.r, redColor.g, redColor.b, userBrightness, "on");
        }
        if (!yeelightDisabled) {
            await yeelightControl(redColor.r, redColor.g, redColor.b, userBrightness, "on");
        }
        if (!ikeaDisabled) {
            await ikeaControl(redColor.r, redColor.g, redColor.b, userBrightness, "on", "red");
        }
        if (!hueDisabled) {
            await hueControl(redColor.r, redColor.g, redColor.b, userBrightness, "on");
        }
        if (!nanoLeafDisabled) {
            await nanoLeafControl(redColor.r, redColor.g, redColor.b, userBrightness, "on");
        }
        if (!openRGBDisabled) {
            await openRGBControl(redColor.r, redColor.g, redColor.b, userBrightness, "on");
        }
        simulatedFlagCounter++
    }
    if (arg === 'Yellow') {
        if (!goveeDisabled) {
            await goveeControl(yellowColor.r, yellowColor.g, yellowColor.b, userBrightness, "on");
        }
        if (!yeelightDisabled) {
            await yeelightControl(yellowColor.r, yellowColor.g, yellowColor.b, userBrightness, "on");
        }
        if (!ikeaDisabled) {
            await ikeaControl(yellowColor.r, yellowColor.g, yellowColor.b, userBrightness, "on", "yellow");
        }
        if (!hueDisabled) {
            await hueControl(yellowColor.r, yellowColor.g, yellowColor.b, userBrightness, "on");
        }
        if (!nanoLeafDisabled) {
            await nanoLeafControl(yellowColor.r, yellowColor.g, yellowColor.b, userBrightness, "on");
        }
        if (!openRGBDisabled) {
            await openRGBControl(yellowColor.r, yellowColor.g, yellowColor.b, userBrightness, "on");
        }
        simulatedFlagCounter++
    }
    if (arg === 'SC') {
        if (!goveeDisabled) {
            await goveeControl(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, userBrightness, "on");
        }
        if (!yeelightDisabled) {
            await yeelightControl(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, userBrightness, "on");
        }
        if (!ikeaDisabled) {
            await ikeaControl(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, userBrightness, "on", "safetyCar");
        }
        if (!hueDisabled) {
            await hueControl(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, userBrightness, "on");
        }
        if (!nanoLeafDisabled) {
            await nanoLeafControl(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, userBrightness, "on");
        }
        if (!openRGBDisabled) {
            await openRGBControl(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, userBrightness, "on");
        }
        simulatedFlagCounter++
    }
    if (arg === 'VSC') {
        if (!goveeDisabled) {
            await goveeControl(vscColor.r, vscColor.g, vscColor.b, userBrightness, "on");
        }
        if (!yeelightDisabled) {
            await yeelightControl(vscColor.r, vscColor.g, vscColor.b, userBrightness, "on");
        }
        if (!ikeaDisabled) {
            await ikeaControl(vscColor.r, vscColor.g, vscColor.b, userBrightness, "on", "vsc");
        }
        if (!hueDisabled) {
            await hueControl(vscColor.r, vscColor.g, vscColor.b, userBrightness, "on");
        }
        if (!nanoLeafDisabled) {
            await nanoLeafControl(vscColor.r, vscColor.g, vscColor.b, userBrightness, "on");
        }
        if (!openRGBDisabled) {
            await openRGBControl(vscColor.r, vscColor.g, vscColor.b, userBrightness, "on");
        }
        simulatedFlagCounter++
    }
    if (arg === 'vscEnding') {
        if (!goveeDisabled) {
            await goveeControl(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, userBrightness, "on");
        }
        if (!yeelightDisabled) {
            await yeelightControl(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, userBrightness, "on");
        }
        if (!ikeaDisabled) {
            await ikeaControl(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, userBrightness, "on", "vscEnding");
        }
        if (!hueDisabled) {
            await hueControl(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, userBrightness, "on");
        }
        if (!nanoLeafDisabled) {
            await nanoLeafControl(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, userBrightness, "on");
        }
        if (!openRGBDisabled) {
            await openRGBControl(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, userBrightness, "on");
        }
        simulatedFlagCounter++
    }
    if (arg === 'alloff') {
        if (!goveeDisabled) {
            await goveeControl(0, 0, 0, 0, "off");
        }
        if (!yeelightDisabled) {
            await yeelightControl(0, 0, 0, 0, "off");
        }
        if (!ikeaDisabled) {
            await ikeaControl(0, 0, 0, 0, "off", "allOff");
        }
        if (!hueDisabled) {
            await hueControl(0, 0, 0, 0, "off");
        }
        if (!nanoLeafDisabled) {
            await nanoLeafControl(0, 0, 0, 0, "off");
        }
        if (!openRGBDisabled) {
            await openRGBControl(0, 0, 0, 0, "off");
        }
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
    console.log(autoUpdater.checkForUpdates())
    win.webContents.send('log', 'Checking for updates...')
})

ipcMain.on('test-button-dev', async () => {
    console.log("Running action mapped on test button...")
    win.webContents.send('log', 'Running action mapped on test button...')
})
ipcMain.on('check-apis', async () => {
    await checkApis();
    await integrationAPIStatus()
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
    if (f1mvCheck) {
        f1mvCheck = false;
        userConfig.set('Settings.MultiViewerForF1Settings.f1mvCheck', false)
        win.webContents.send('log', 'Disabled F1MV Sync!')
        console.log('Disabled F1MV Sync!')
    } else if (!f1mvCheck) {
        f1mvCheck = true;
        userConfig.set('Settings.MultiViewerForF1Settings.f1mvCheck', true)
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
    } else if (!autoDevTools) {
        userConfig.set('devConfig.autoStartDevTools', true);
        win.webContents.send('log', 'Enabled auto start dev tools')
        console.log('Enabled auto dev tools')
    }
})
ipcMain.on('send-config', () => {
    const config = userConfig.store;
    win.webContents.send('settings', config);
})
ipcMain.on('reload-from-config', () => {
    reloadFromConfig();
})
ipcMain.on('hide-disabled-integrations', () => {
    const config = userConfig.store
    win.webContents.send('hide-disabled-integrations', config)
})
ipcMain.on('restart-app', () => {
    if (!ikeaDisabled && ikeaOnline) {
        fetch("http://localhost:9898/quit")
    }
    app.relaunch();
    app.exit(0);
})

ipcMain.on('linkHue', async () => {
    win.webContents.send('toaster', 'Searching for Hue bridge this may take a few seconds...')
    if (debugPreference) {
        console.log("Linking Hue...")
        win.webContents.send('log', 'Linking Hue...')
    }
    await hueInitialize();
})
ipcMain.on('getHueDevices', async () => {
    if (debugPreference) {
        console.log("Getting Hue Devices...")
        win.webContents.send('log', 'Getting Hue Devices...')
    }
    await hueControl(0, 255, 0, userBrightness, "getDevices");
})
let canReceive = false;
ipcMain.on('nanoLeaf', async (event, args) => {
    if(args === 'openWindow'){
        if (debugPreference) {
            console.log("Opening NanoLeaf Setup Window...")
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
            console.log("Connecting to Nanoleaf Device...")
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
    if (userConfig.get('version') !== 8) {
        console.log('Migrating config...')
        win.webContents.send('log', 'Migrating config...')
        // migrate the config
        const oldConfig = userConfig.store;
        const newConfig = {
            "Settings": {
                "generalSettings": {
                    "autoTurnOffLights": oldConfig.Settings.generalSettings.autoTurnOffLights,
                    "defaultBrightness": oldConfig.Settings.generalSettings.defaultBrightness,
                    "hideLogs": true,
                    "colorSettings": {
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
                            g: 145,
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
                    "liveTimingURL": "http://localhost:10101",
                    "f1mvCheck": true
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
                    "openRGBDisable": true,
                    "openRGBServerIP": "localhost",
                    "openRGBServerPort": 6742,
                },
                "nanoLeafSettings": {
                    "nanoLeafDisable": oldConfig.Settings.nanoLeafSettings.nanoLeafDisable,
                    "devices": oldConfig.Settings.nanoLeafSettings.devices
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
            "version": 8
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
            if (errorCheck !== true) {
                errorCheck = true;
                console.log("Failed to get the data from the F1MV API: " + e);
                win.webContents.send('log', "Failed to get the data from the F1MV API: " + e);
            }
        }
    }
}

async function f1mvLightSync() {
    if (TStateCheck !== TState && SState !== "Ends" && SState !== "Finalised") {
        flagSwitchCounter++
        switch (TState) {
            case "1":
                console.log("Green flag!")
                win.webContents.send('log', "Green flag!")
                if (!goveeDisabled) {
                    await goveeControl(greenColor.r, greenColor.g, greenColor.b, userBrightness, "on")
                }
                if (!yeelightDisabled) {
                    await yeelightControl(greenColor.r, greenColor.g, greenColor.b, userBrightness, "on")
                }
                if (!ikeaDisabled) {
                    await ikeaControl(greenColor.r, greenColor.g, greenColor.b, userBrightness, "on", "green")
                }
                if (!hueDisabled) {
                    await hueControl(greenColor.r, greenColor.g, greenColor.b, userBrightness, "on")
                }
                if (!nanoLeafDisabled) {
                    await nanoLeafControl(greenColor.r, greenColor.g, greenColor.b, userBrightness, "on")
                }
                if (!openRGBDisabled) {
                    await openRGBControl(greenColor.r, greenColor.g, greenColor.b, userBrightness, "on")
                }
                TStateCheck = TState
                break;
            case "2":
                console.log("Yellow flag!")
                win.webContents.send('log', "Yellow flag!")
                if (!goveeDisabled) {
                    await goveeControl(yellowColor.r, yellowColor.g, yellowColor.b, userBrightness, "on")
                }
                if (!yeelightDisabled) {
                    await yeelightControl(yellowColor.r, yellowColor.g, yellowColor.b, userBrightness, "on")
                }
                if (!ikeaDisabled) {
                    await ikeaControl(yellowColor.r, yellowColor.g, yellowColor.b, userBrightness, "on", "yellow")
                }
                if (!hueDisabled) {
                    await hueControl(yellowColor.r, yellowColor.g, yellowColor.b, userBrightness, "on")
                }
                if (!nanoLeafDisabled) {
                    await nanoLeafControl(yellowColor.r, yellowColor.g, yellowColor.b, userBrightness, "on")
                }
                if (!openRGBDisabled) {
                    await openRGBControl(yellowColor.r, yellowColor.g, yellowColor.b, userBrightness, "on")
                }
                TStateCheck = TState
                break;
            case "4":
                console.log("Safety car!")
                win.webContents.send('log', "Safety car!")
                if (!goveeDisabled) {
                    await goveeControl(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, userBrightness, "on")
                }
                if (!yeelightDisabled) {
                    await yeelightControl(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, userBrightness, "on")
                }
                if (!ikeaDisabled) {
                    await ikeaControl(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, userBrightness, "on", "safetyCar")
                }
                if (!hueDisabled) {
                    await hueControl(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, userBrightness, "on")
                }
                if (!nanoLeafDisabled) {
                    await nanoLeafControl(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, userBrightness, "on")
                }
                if (!openRGBDisabled) {
                    await openRGBControl(safetyCarColor.r, safetyCarColor.g, safetyCarColor.b, userBrightness, "on")
                }
                TStateCheck = TState
                break;
            case "5":
                console.log("Red flag!")
                win.webContents.send('log', "Red flag!")
                if (!goveeDisabled) {
                    await goveeControl(redColor.r, redColor.g, redColor.b, userBrightness, "on")
                }
                if (!yeelightDisabled) {
                    await yeelightControl(redColor.r, redColor.g, redColor.b, userBrightness, "on")
                }
                if (!ikeaDisabled) {
                    await ikeaControl(redColor.r, redColor.g, redColor.b, userBrightness, "on", "red")
                }
                if (!hueDisabled) {
                    await hueControl(redColor.r, redColor.g, redColor.b, userBrightness, "on")
                }
                if (!nanoLeafDisabled) {
                    await nanoLeafControl(redColor.r, redColor.g, redColor.b, userBrightness, "on")
                }
                if (!openRGBDisabled) {
                    await openRGBControl(redColor.r, redColor.g, redColor.b, userBrightness, "on")
                }
                TStateCheck = TState
                break;
            case "6":
                console.log("Virtual safety car!")
                win.webContents.send('log', "Virtual safety car!")
                if (!goveeDisabled) {
                    await goveeControl(vscColor.r, vscColor.g, vscColor.b, userBrightness, "on")
                }
                if (!yeelightDisabled) {
                    await yeelightControl(vscColor.r, vscColor.g, vscColor.b, userBrightness, "on")
                }
                if (!ikeaDisabled) {
                    await ikeaControl(vscColor.r, vscColor.g, vscColor.b, userBrightness, "on", "vsc")
                }
                if (!hueDisabled) {
                    await hueControl(vscColor.r, vscColor.g, vscColor.b, userBrightness, "on")
                }
                if (!nanoLeafDisabled) {
                    await nanoLeafControl(vscColor.r, vscColor.g, vscColor.b, userBrightness, "on")
                }
                if (!openRGBDisabled) {
                    await openRGBControl(vscColor.r, vscColor.g, vscColor.b, userBrightness, "on")
                }
                TStateCheck = TState
                break;
            case "7":
                console.log("VSC Ending")
                win.webContents.send('log', "VSC Ending")
                if (!goveeDisabled) {
                    await goveeControl(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, userBrightness, "on")
                }
                if (!yeelightDisabled) {
                    await yeelightControl(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, userBrightness, "on")
                }
                if (!ikeaDisabled) {
                    await ikeaControl(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, userBrightness, "on", "vscEnding")
                }
                if (!hueDisabled) {
                    await hueControl(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, userBrightness, "on")
                }
                if (!nanoLeafDisabled) {
                    await nanoLeafControl(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, userBrightness, "on")
                }
                if (!openRGBDisabled) {
                    await openRGBControl(vscEndingColor.r, vscEndingColor.g, vscEndingColor.b, userBrightness, "on")
                }
                TStateCheck = TState
                break;
        }
    } else if (SState === "Ends" || SState === "Finalised") {
        if (SStateCheck !== SState) {
            if (autoOff) {
                console.log("Session ended, turning off lights...")
                win.webContents.send('log', "Session ended, turning off lights...")
                if (!goveeDisabled) {
                    await goveeControl(0, 255, 0, userBrightness, "off")
                }
                if (!yeelightDisabled) {
                    await yeelightControl(0, 255, 0, userBrightness, "off")
                }
                if (!ikeaDisabled) {
                    await ikeaControl(0, 255, 0, userBrightness, "off", "off")
                }
                if (!hueDisabled) {
                    await hueControl(0, 255, 0, userBrightness, "off")
                }
                if (!nanoLeafDisabled) {
                    await nanoLeafControl(0, 255, 0, userBrightness, "off")
                }
                if (!openRGBDisabled) {
                    await openRGBControl(0, 255, 0, userBrightness, "off")
                }
                SStateCheck = SState
            }
        }
    }
}

setTimeout(function () {
    setInterval(function () {
        if (BrowserWindow.getAllWindows().length > 0) {
            if (f1mvCheck) {
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
        }
    }, 400);
}, 1000);

setTimeout(function () {
    checkApis().then(r => {
        if (alwaysFalse) {
            console.log(r)
        }
    });
    setInterval(function () {
        if (BrowserWindow.getAllWindows().length > 0) {
            checkApis().then(r => {
                if (alwaysFalse) {
                    console.log(r)
                }
            });
        }
    }, 15000);
}, 1000);

async function initIntegrations(){
    setTimeout(function () {
        toggleInit()
    }, 1000);
    if (!ikeaDisabled) {
        ikeaInitialize().then(r => {
            if (alwaysFalse) {
                console.log(r)
            }
        });
    }
    if (!goveeDisabled) {
        goveeInitialize().then(r => {
            if (alwaysFalse) {
                console.log(r)
            }
        });
    }
    if (!hueDisabled) {
        hueInitialize().then(r => {
            if (alwaysFalse) {
                console.log(r)
            }
        });
    }
    if (!openRGBDisabled) {
        openRGBInitialize().then(r => {
            if (alwaysFalse) {
                console.log(r)
            }
        });
    }
    await integrationAPIStatus();
}
async function integrationAPIStatus(){
    await otherAPIStatus()
    await integrationAPIStatusSend()
    setInterval(async function () {
        if (BrowserWindow.getAllWindows().length > 0) {
            await integrationAPIStatusSend()
        }
    }, 5000);
}

async function integrationAPIStatusSend(){
    if (ikeaOnline) {
        win.webContents.send('ikeaAPI', 'online');
    }
    if (goveeOnline) {
        win.webContents.send('goveeAPI', 'online');
    }
    if (hueOnline) {
        win.webContents.send('hueAPI', 'online');
    }
    if(openRGBOnline){
        win.webContents.send('openRGBAPI', 'online');
    }
    if (!yeelightDisabled) {
        win.webContents.send('yeelightAPI', 'online')
    }
    if (nanoLeafDevices.length > 0) {
        nanoLeafOnline = true
        win.webContents.send('nanoLeafAPI', 'online')
    }
}

async function otherAPIStatus(){
    setInterval(function () {
        if (BrowserWindow.getAllWindows().length > 0) {
            if (f1mvAPIOnline) {
                win.webContents.send('f1mvAPI', 'online');
            }
            if(f1LiveSession){
                win.webContents.send('f1tvAPI', 'online');
            }
            if (updateAPIOnline){
                win.webContents.send('updateAPI', 'online');
            }
        }
    }, 5000);
}

async function goveeControl(r, g, b, brightness, action) {
    govee.devicesArray.forEach(device => {
        if (debugPreference) {
            console.log("Device selected: " + device.model);
            win.webContents.send('log', "Device selected: " + device.model);
        }
        if (action === "on") {
            lightsOnCounter++
            if (debugPreference) {
                console.log("Turning on the Govee light with the following settings: " + "R: " + r + " G: " + g + " B: " + b + " Brightness: " + brightness);
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
                console.log("Turning off Govee light " + device.model);
                win.webContents.send('log', "Turning off Govee light " + device.model);
            }
            device.actions.setOff();
        }
        if (action === "getState") {
            if (debugPreference) {
                console.log("Getting the state of Govee light " + device.model);
            }
            if (device.state.isOn === 1) {
                console.log("The light is on");
            } else {
                console.log("The light is off");
            }
            console.log("The brightness is: " + device.state.brightness);
            console.log("The color is: " + device.state.color);
        }
    });
}

async function goveeInitialize() {

    goveeOnline = true;

    govee.on("deviceAdded", (device) => {
        if (debugPreference) {
            console.log("Govee device found: " + device.model);
            win.webContents.send('log', "Govee device found: " + device.model);
        }

    });
}
async function ikeaInitialize() {
    const {
        exec
    } = require('child_process');
    if (debugPreference) {
        console.log("Initializing IKEA Tradfri...");
        win.webContents.send('log', "Initializing IKEA Tradfri...");
    }
    let debug;
    if (debugPreference) {
        debug = "--debug";
    } else {
        debug = "";
    }
    const path = require('path');
    let startPath = path.join(app.getAppPath(), 'ikea.js');
    const startCommand = 'node ' + startPath + ' ' + '--' + ikeaSecurityCode + ' ' + debug;
    let child;
    let errorDetected = false;
    child = exec(startCommand, (err) => {
        if (err) {
            errorDetected = true;
            ikeaOnline = false;
            if (err.message.includes('EADDRINUSE')) {
                console.log("The IKEA Tradfri Server is already running, stopping the old instance and starting a new one.");
                win.webContents.send('log', "The IKEA Tradfri Server is already running, stopping the old instance and starting a new one.");
                fetch('http://localhost:9898/quit');
                setTimeout(function () {
                    ikeaInitialize();
                }, 1000);
            } else {
                console.log("An error occured while starting the IKEA Tradfri Server: " + err.message);
                win.webContents.send('log', "An error occured while starting the IKEA Tradfri Server: " + err.message);
            }
        }
    });
    child.stdout.on('data', (data) => {
        console.log(data);
        win.webContents.send('log', data);
        if (data.includes("The Ikea Tradfri integration started successfully!")) {
            ikeaOnline = true;
            if (debugPreference) {
                console.log("IKEA Tradfri plugin started successfully");
                win.webContents.send('log', "IKEA Tradfri plugin started successfully");
            }
        }
    });
    child.stderr.on('data', (data) => {
        console.log(data);
        win.webContents.send('log',data);
    });
}
app.on('window-all-closed',  () => {
    if(!ikeaDisabled && ikeaOnline){
        fetch('http://localhost:9898/quit');
    }
});

async function ikeaControl(r, g, b, brightness, action, flag) {
    if(ikeaOnline) {
        for (let i = 0; i < ikeaDevices.length; i++) {
            if (debugPreference) {
                console.log("Checking if Ikea device is RGB or White")
                win.webContents.send('log', "Checking if Ikea device is RGB or White")
                console.log("Device to check: " + ikeaDevices[i])
                win.webContents.send('log', "Device to check: " + ikeaDevices[i])
            }
            if (devicesDone.includes(ikeaDevices[i]) && !configHasBeenReloadedIkeaCheck ) {
                if (debugPreference) {
                    win.webContents.send('log', "Device already done, skipping...");
                    console.log("Device already done, skipping...");
                }
            }
            else {
                if(configHasBeenReloadedIkeaCheck){
                    devicesDone = [];
                    whiteDevices = [];
                    colorDevices = [];
                    configHasBeenReloadedIkeaCheck = false;
                }
                const response = await fetch('http://localhost:9898/getSpectrum/' + ikeaDevices[i]);
                const json = await response.json();
                devicesDone.push(ikeaDevices[i]);
                if (json.spectrum === "rgb") {
                    colorDevices.push(ikeaDevices[i]);
                } else {
                    whiteDevices.push(ikeaDevices[i]);
                }
            }
        }
    }

    const fs = require('fs');
    if (action === "getDevices") {
        // send a request to localhost:9898/getDevices, then create a html file with a table of all the devices with their names, ids, state, and spectrum, make sure the html is beautified and has a nice design, after that all, open the html in a new electron window
        const response = await fetch('http://localhost:9898/getDevices');
        const json = await response.json();
        // create the html file, make sure it is dark mode
        let html = "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'><title>Devices</title><link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css'><script src='https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js'></script><script src='https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js'></script><script src='https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js'></script></head><body><div class='container'><table class='table table-dark table-striped'><thead><tr><th>Device Name</th><th>Device ID</th><th>Device Is On</th><th>Color support</th></tr></thead><tbody>";
        json.forEach(device => {
            html = html + "<tr><td>" + device.name + "</td><td>" + device.id + "</td><td>" + device.state + "</td><td>" + device.spectrum + "</td></tr>";
        });
        html = html + "</tbody></table></div></body></html>";
        const path = require('path');
        const savePath = path.join(app.getAppPath(), 'devices.html');
        fs.writeFile(savePath, html, function (err) {
            if (err) throw err;
            console.log('Saved!');
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
            console.log("Turning on the Ikea lights...");
        }

        // convert rgb to hsl
        const colorConvert = require("color-convert");
        const hsl = colorConvert.rgb.hsl(r, g, b);
        hue = hsl[0];
        if (debugPreference) {
            console.log("The converted hue value from the given RGB value for Ikea is: " + hue);
        }
        colorDevices.forEach(device => {
            if(debugPreference){
                console.log("Turning on the Ikea RGB light with the ID: " + device);
                win.webContents.send('log', "Turning on the Ikea RGB light with the ID: " + device);
            }
            device = parseInt(device);
            fetch('http://localhost:9898/toggleDevice?deviceId=' + device + '&state=on');
            fetch('http://localhost:9898/setHue?deviceId=' + device + '&state=' + hue);
            fetch('http://localhost:9898/setBrightness?deviceId=' + device + '&state=' + brightness);
        });
        whiteDevices.forEach(device => {
            if(debugPreference){
                console.log("Turning on the Ikea White light with the ID: " + device);
                win.webContents.send('log', "Turning on the Ikea White light with the ID: " + device);
            }
            device = parseInt(device);
            if (flag !== "green") {
                fetch('http://localhost:9898/toggleDevice?deviceId=' + device + '&state=on');
                fetch('http://localhost:9898/setBrightness?deviceId=' + device + '&state=' + brightness);
            } else if (flag === "green") {
                fetch('http://localhost:9898/toggleDevice?deviceId=' + device + '&state=off');
            }
        });

    }
    if (action === "off" && ikeaOnline === true) {
        lightsOffCounter++;
        colorDevices.forEach(device => {
            if(debugPreference){
                console.log("Turning off the Ikea RGB light with the ID: " + device);
                win.webContents.send('log', "Turning off the Ikea RGB light with the ID: " + device);
            }
            device = parseInt(device);
            fetch('http://localhost:9898/toggleDevice?deviceId=' + device + '&state=off');
        });
        whiteDevices.forEach(device => {
            if(debugPreference){
                console.log("Turning off the Ikea White light with the ID: " + device);
                win.webContents.send('log', "Turning off the Ikea White light with the ID: " + device);
            }
            device = parseInt(device);
            fetch('http://localhost:9898/toggleDevice?deviceId=' + device + '&state=off');
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
                            console.log("Turning on the Yeelight light with the IP: " + light);
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
                            console.log("Turning off the Yeelight light with the IP: " + light);
                            win.webContents.send('log', "Turning off the Yeelight light with the IP: " + light);
                        }
                        lightsOffCounter++
                        lamp.off();
                        lamp.disconnect();
                    }
                } catch (err) {
                    if (debugPreference) {
                        win.webContents.send('log', "Error while performing an action on a YeeLight light: " + err);
                        console.log("Error while performing an action on a YeeLight light: " + err);
                    }
                }
            });
            bulb.on('error', (err) => {
                if (debugPreference) {
                    win.webContents.send('log', "Error while connecting to a YeeLight light: " + err);
                    console.log("Error while connecting to a YeeLight light: " + err);
                }
            });
            bulb.connect();
        });
    }
}

const hue = require("node-hue-api");
const fs = require("fs");
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
            console.log("Hue bridge found at: " + hueApi[0].ipaddress);
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
                    if (debugPreference) {
                        console.log(err);
                    }
                }
            } catch (error) {
                win.webContents.send('log', `Unexpected Error: ${err.message}`);
                if (debugPreference) {
                    console.log(err);
                }
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
                console.log("No Hue lights found or an error occurred");
                win.webContents.send('toaster', "No Hue lights found or an error occurred");
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
            width: 800,
            height: 900,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
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
        if(debugPreference){
            console.log("Turning all the available Nanoleaf devices on...");
            win.webContents.send('log', "Turning all the available Nanoleaf devices on...");
        }
        let hue;
        const colorConvert = require("color-convert");
        const hsl = colorConvert.rgb.hsl(r, g, b);
        hue = hsl[0];
        if (debugPreference) {
            console.log("Converted the given RGB for Nanoleaf to a hue value, new value is: " + hue);
        }
        for (const device of nanoLeafDevices) {
            if(debugPreference){
                console.log("Turning on Nanoleaf device with host: " + device.host + " and token: " + device.token);
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
        if(debugPreference){
            console.log("Turning all the available Nanoleaf devices off...");
            win.webContents.send('log', "Turning all the available Nanoleaf devices off...");
        }
        for (const device of nanoLeafDevices) {
            if(debugPreference){
                console.log("Turning off Nanoleaf device with host: " + device.host + " and token: " + device.token);
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
        console.log("Opening the add other device dialog for Nanoleaf...");
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

ipcMain.on('link-openrgb', (event, arg) => {
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
        client = new Client("F1MV-Lights-Integration", openRGBPort, openRGBIP);
        await client.connect()
        if(debugPreference){
            console.log("Connected to OpenRGB!");
            win.webContents.send('log', "Connected to OpenRGB!");
            if(toast){
                win.webContents.send('toaster', "Connected to OpenRGB!");
            }
        }
        openRGBOnline = true;
    } catch (error) {
        openRGBOnline = false;
        setTimeout(() => {
            console.log("Error: Could not connect to OpenRGB, please make sure that OpenRGB is running and that the IP + Port are correct!");
            win.webContents.send('log', "Error: Could not connect to OpenRGB, please make sure that OpenRGB is running and that the IP + Port are correct!");
            if(toast){
                win.webContents.send('toaster', "Could not connect to OpenRGB!");
            }
        }, 1000);
    }
}
async function openRGBControl(r, g, b, brightness, action){
    if(openRGBOnline) {
        if (debugPreference) {
            console.log("Getting all the available OpenRGB devices...");
            win.webContents.send('log', "Getting all the available OpenRGB devices...");
        }
        const deviceCount = await client.getControllerCount()
        if (debugPreference) {
            console.log("Found " + deviceCount + " OpenRGB devices!");
            win.webContents.send('log', "Found " + deviceCount + " OpenRGB devices!");
        }
        if (action === 'on') {
            if (debugPreference) {
                console.log("Turning all the available OpenRGB devices on...");
                win.webContents.send('log', "Turning all the available OpenRGB devices on...");
            }
            for (let i = 0; i < deviceCount; i++) {
                let device = await client.getControllerData(i)
                await client.updateMode(i, 0)

                if (debugPreference) {
                    console.log("Turning on OpenRGB device with name: " + device.name + " and values: " + r + ", " + g + ", " + b + ", " + brightness);
                    win.webContents.send('log', "Turning on OpenRGB device with name: " + device.name + " and values: " + r + ", " + g + ", " + b + ", " + brightness);
                }

                const colors = Array(device.colors.length).fill({
                    red: r,
                    green: g,
                    blue: b
                })
                await client.updateLeds(i, colors)
                if (debugPreference) {
                    console.log('Successfully updated the colors of the OpenRGB device with name: ' + device.name);
                    win.webContents.send('log', 'Successfully updated the colors of the OpenRGB device with name: ' + device.name);
                }
            }
        }
        if (action === 'off') {
            if (debugPreference) {
                console.log("Turning all the available OpenRGB devices off...");
                win.webContents.send('log', "Turning all the available OpenRGB devices off...");
            }
            for (let i = 0; i < deviceCount; i++) {
                let device = await client.getControllerData(i)
                await client.updateMode(i, 0)

                if (debugPreference) {
                    console.log("Turning off OpenRGB device with name: " + device.name);
                    win.webContents.send('log', "Turning off OpenRGB device with name: " + device.name);
                }

                const colors = Array(device.colors.length).fill({
                    red: 0,
                    green: 0,
                    blue: 0
                })
                await client.updateLeds(i, colors)
                if (debugPreference) {
                    console.log('Successfully updated the colors of the OpenRGB device with name: ' + device.name);
                    win.webContents.send('log', 'Successfully updated the colors of the OpenRGB device with name: ' + device.name);
                }
            }
        }
    } else if(debugPreference){
        console.log("There is no active connection to OpenRGB, please make sure that OpenRGB is running and that the IP + Port are correct! Restart the application to try connecting to OpenRGB again.");
        win.webContents.send('log', "There is no active connection to OpenRGB, please make sure that OpenRGB is running and that the IP + Port are correct! Restart the application to try connecting to OpenRGB again.");
    }
}
app.on('window-all-closed', () => {
    client.disconnect()
})
async function checkApis() {
    if(debugPreference){
        console.log("Checking the Update and F1 Live Session API..");
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
        if (data.error === 'No data found, do you have live timing running?') {
            f1mvAPIOnline = false;
        } else {
            f1mvAPIOnline = true;
        }
    } catch (error) {
        if(errorCheck === false){
            console.log('Error: Could not connect to the F1MV API, please make sure that you have F1MV open, and the Live Timing is running!');
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

    win.webContents.send('log', "Reloaded from config!");
    configHasBeenReloadedIkeaCheck = true;
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
        console.log("There is an update available. Downloading now... You will be notified when the update is ready to install.")
        win.webContents.send('log', 'There is an update available. Downloading now... You will be notified when the update is ready to install.')
    } else if (process.platform === "darwin") {
        console.log("There is an update available. Unfortunately, auto-updating is not supported on macOS. Please download the latest version from GitHub.")
        win.webContents.send('log', 'There is an update available. Unfortunately, auto-updating is not supported on macOS. Please download the latest version from GitHub.')
    }
})
autoUpdater.on('update-not-available', () => {
    if (!noUpdateFound) {
        console.log("There are no updates available.")
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