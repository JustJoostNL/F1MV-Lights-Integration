const { ipcRenderer } = require('electron');

$(function() {
    ipcRenderer.on('f1mvAPI', (event, arg) => {
        if (arg === 'online') {
            $('#f1mv').find('.status').removeClass('error').addClass('success')
        }

        if (arg === 'offline') {
            $('#f1mv').find('.status').removeClass('success').addClass('error')
        }
    })

    ipcRenderer.on('goveeAPI', (event, arg) => {
        if (arg === 'online') {
            $('#goveeAPI').find('.status').removeClass('error').addClass('success')
        }

        if (arg === 'offline') {
            $('#goveeAPI').find('.status').removeClass('success').addClass('error')
        }
    })

    ipcRenderer.on('updateAPI', (event, arg) => {
        if (arg === 'online') {
            $('#updateAPI').find('.status').removeClass('error').addClass('success')
        }

        if (arg === 'offline') {
            $('#updateAPI').find('.status').removeClass('success').addClass('error')
        }
    })

    ipcRenderer.on('f1tvAPI', (event, arg) => {
        if (arg === 'online') {
            $('#f1tvAPI').find('.status').removeClass('error').addClass('success')
        }

        if (arg === 'offline') {
            $('#f1tvAPI').find('.status').removeClass('success').addClass('error')
        }
    })

    ipcRenderer.on('ikeaAPI', (event, arg) => {
        if (arg === 'online') {
            $('#ikeaAPI').find('.status').removeClass('error').addClass('success')
        }

        if (arg === 'offline') {
            $('#ikeaAPI').find('.status').removeClass('success').addClass('error')
        }
    })
    ipcRenderer.on('yeelightAPI', (event, arg) => {
        if (arg === 'online') {
            $('#yeelightAPI').find('.status').removeClass('error').addClass('success')
        }

        if (arg === 'offline') {
            $('#yeelightAPI').find('.status').removeClass('success').addClass('error')
        }
    })
    ipcRenderer.on('hueAPI', (event, arg) => {
        if (arg === 'online') {
            $('#hueAPI').find('.status').removeClass('error').addClass('success')
        }

        if (arg === 'offline') {
            $('#hueAPI').find('.status').removeClass('success').addClass('error')
        }
    })
    ipcRenderer.on('nanoLeafAPI', (event, arg) => {
        if (arg === 'online') {
            $('#nanoLeafAPI').find('.status').removeClass('error').addClass('success')
        }

        if (arg === 'offline') {
            $('#nanoLeafAPI').find('.status').removeClass('success').addClass('error')
        }
    })

    ipcRenderer.on('openRGBAPI', (event, arg) => {
        if (arg === 'online') {
            $('#openRGBAPI').find('.status').removeClass('error').addClass('success')
        }

        if (arg === 'offline') {
            $('#openRGBAPI').find('.status').removeClass('success').addClass('error')
        }
    })

    ipcRenderer.on('settings', (event, arg) => {
        $('#brightness-input').val(arg.Settings.generalSettings.defaultBrightness)
        
        if (arg.Settings.generalSettings.autoTurnOffLights) {
            $('#auto-turn-off-setting').attr('checked', 'checked')
        }else if (!arg.Settings.generalSettings.autoTurnOffLights) {
            $('#auto-turn-off-setting').removeAttr('checked')
        }
        
        $('#live-timing-url-input').val(arg.Settings.MultiViewerForF1Settings.liveTimingURL)

        if (arg.Settings.ikeaSettings.ikeaDisable) {
            $('#disable-ikea-setting').attr('checked', 'checked')
        }else if (!arg.Settings.ikeaSettings.ikeaDisable) {
            $('#disable-ikea-setting').removeAttr('checked')
        }
        
        $('#sec-code-input').val(arg.Settings.ikeaSettings.securityCode)
        $('#devices-input').val(arg.Settings.ikeaSettings.deviceIDs)
        if (arg.Settings.goveeSettings.goveeDisable) {
            $('#disable-govee-setting').attr('checked', 'checked')
        }else if (!arg.Settings.goveeSettings.goveeDisable) {
            $('#disable-govee-setting').removeAttr('checked')
        }
        $('#gatw-token-input').val(arg.Settings.hueSettings.token)
        $('#hue-devices-input').val(arg.Settings.hueSettings.deviceIDs)

        $('#govee-dis-devices-input').val(arg.Settings.goveeSettings.devicesDisabledIPs)

        if (arg.Settings.yeeLightSettings.yeeLightDisable) {
            $('#disable-yeelight-setting').attr('checked', 'checked')
        }else if (!arg.Settings.yeeLightSettings.yeeLightDisable) {
            $('#disable-yeelight-setting').removeAttr('checked')
        }

        $('#yeelight-device-ip-input').val(arg.Settings.yeeLightSettings.deviceIPs)
        $('#nanoleaf-device-ip-input').val(arg.Settings.nanoLeafSettings.devices)

        // search in the settings for the dropdown menu with this id: 'update-channel-setting' and set the value to the current update channel
        $('#update-channel-setting').val(arg.Settings.advancedSettings.updateChannel)

        if (arg.Settings.advancedSettings.analytics) {
            $('#analytics-setting').attr('checked', 'checked')
        }else if (!arg.Settings.advancedSettings.analytics) {
            $('#analytics-setting').removeAttr('checked')
        }

        if (arg.Settings.advancedSettings.debugMode) {
            $('#debug-mode-setting').attr('checked', 'checked')
        }else if (!arg.Settings.advancedSettings.debugMode) {
            $('#debug-mode-setting').removeAttr('checked')
        }

        if (arg.Settings.hueSettings.hueDisable) {
            $('#disable-hue-setting').attr('checked', 'checked')
        }else if (!arg.Settings.hueSettings.hueDisable) {
            $('#disable-hue-setting').removeAttr('checked')
        }

        if (arg.Settings.nanoLeafSettings.nanoLeafDisable) {
            $('#disable-nanoleaf-setting').attr('checked', 'checked')
        }else if (!arg.Settings.nanoLeafSettings.nanoLeafDisable) {
            $('#disable-nanoleaf-setting').removeAttr('checked')
        }
        
        if (arg.Settings.openRGBSettings.openRGBDisable) {
            $('#disable-openrgb-setting').attr('checked', 'checked')
        }else if (!arg.Settings.openRGBSettings.openRGBDisable) {
            $('#disable-openrgb-setting').removeAttr('checked')
        }
        
        $('#openrgb-ip-input').val(arg.Settings.openRGBSettings.openRGBServerIP)
        $('#openrgb-port-input').val(arg.Settings.openRGBSettings.openRGBServerPort)

        $('#nanoleaf-lights').show();
        arg.Settings.nanoLeafSettings.devices.forEach(function(light) {
            $('#nanoleaf-lights').append(`<div class="check" id="${light.host}"><span class="status success"></span><p>${light.host}</p></div>`)
        })


        $('#green-flag-red').val(arg.Settings.generalSettings.colorSettings.green.r)
        $('#green-flag-green').val(arg.Settings.generalSettings.colorSettings.green.g)
        $('#green-flag-blue').val(arg.Settings.generalSettings.colorSettings.green.b)
        $('#yellow-flag-red').val(arg.Settings.generalSettings.colorSettings.yellow.r)
        $('#yellow-flag-green').val(arg.Settings.generalSettings.colorSettings.yellow.g)
        $('#yellow-flag-blue').val(arg.Settings.generalSettings.colorSettings.yellow.b)
        $('#red-flag-red').val(arg.Settings.generalSettings.colorSettings.red.r)
        $('#red-flag-green').val(arg.Settings.generalSettings.colorSettings.red.g)
        $('#red-flag-blue').val(arg.Settings.generalSettings.colorSettings.red.b)
        $('#sc-flag-red').val(arg.Settings.generalSettings.colorSettings.safetyCar.r)
        $('#sc-flag-green').val(arg.Settings.generalSettings.colorSettings.safetyCar.g)
        $('#sc-flag-blue').val(arg.Settings.generalSettings.colorSettings.safetyCar.b)
        $('#vsc-flag-red').val(arg.Settings.generalSettings.colorSettings.vsc.r)
        $('#vsc-flag-green').val(arg.Settings.generalSettings.colorSettings.vsc.g)
        $('#vsc-flag-blue').val(arg.Settings.generalSettings.colorSettings.vsc.b)
        $('#vscEnd-flag-red').val(arg.Settings.generalSettings.colorSettings.vscEnding.r)
        $('#vscEnd-flag-green').val(arg.Settings.generalSettings.colorSettings.vscEnding.g)
        $('#vscEnd-flag-blue').val(arg.Settings.generalSettings.colorSettings.vscEnding.b)


    })

})

    ipcRenderer.on('log', (event, arg) => {
        $('#log').prepend(`<p style="color: white;">[${new Date().toLocaleTimeString('en-GB', {hour12: false})}] ${arg}</p>`)
    })
    
    ipcRenderer.on('dev', (event, arg) => {
        if (arg === true) {
            $('#dev').show()

        } else if(arg === false) {
            $('#dev').hide()
        }
    })

    ipcRenderer.on('test-mode', (event, arg) => {
        if (arg === true) {
            $('#test').show()

        } else if(arg === false) {
            $('#test').hide()
        }
    })

    ipcRenderer.on('auto-devtools', (event, arg) => {
        // change the icon from code to code_off
        $('#dev').find('i').removeClass('code').addClass('code_off')
    })

function saveConfig() {
    ipcRenderer.send('saveConfig', {
        defaultBrightness: $('#brightness-input').val(),
        autoTurnOffLights: $('#auto-turn-off-setting').is(':checked'),
        liveTimingURL: $('#live-timing-url-input').val(),
        hueDisable: $('#disable-hue-setting').is(':checked'),
        hueToken: $('#gatw-token-input').val(),
        hueDevices: $('#hue-devices-input').val(),
        ikeaDisable: $('#disable-ikea-setting').is(':checked'),
        securityCode: $('#sec-code-input').val(),
        deviceIDs: $('#devices-input').val(),
        goveeDisable: $('#disable-govee-setting').is(':checked'),
        openRGBDisable: $('#disable-openrgb-setting').is(':checked'),
        openRGBServerIP: $('#openrgb-ip-input').val(),
        openRGBServerPort: $('#openrgb-port-input').val(),
        nanoLeafDisable: $('#disable-nanoleaf-setting').is(':checked'),
        yeeLightDisable: $('#disable-yeelight-setting').is(':checked'),
        deviceIPs: $('#yeelight-device-ip-input').val(),
        updateChannel: $('#update-channel-setting').val(),
        analytics: $('#analytics-setting').is(':checked'),
        debugMode: $('#debug-mode-setting').is(':checked')
    })
}
function saveConfigColors() {
    ipcRenderer.send('saveConfigColors', {
        green: {
            r: $('#green-flag-red').val(),
            g: $('#green-flag-green').val(),
            b: $('#green-flag-blue').val()
        },
        yellow: {
            r: $('#yellow-flag-red').val(),
            g: $('#yellow-flag-green').val(),
            b: $('#yellow-flag-blue').val()
        },
        red: {
            r: $('#red-flag-red').val(),
            g: $('#red-flag-green').val(),
            b: $('#red-flag-blue').val()
        },
        safetyCar: {
            r: $('#sc-flag-red').val(),
            g: $('#sc-flag-green').val(),
            b: $('#sc-flag-blue').val()
        },
        vsc: {
            r: $('#vsc-flag-red').val(),
            g: $('#vsc-flag-green').val(),
            b: $('#vsc-flag-blue').val()
        },
        vscEnding: {
            r: $('#vscEnd-flag-red').val(),
            g: $('#vscEnd-flag-green').val(),
            b: $('#vscEnd-flag-blue').val()
        }
    })
}

function linkHue() {
    ipcRenderer.send('linkHue')
}

function nanoLeaf(action) {
    if(action === 'device'){
        let ip = $('#nanoleaf-device-ip-input-in-connect-screen').val()
        ipcRenderer.send('nanoLeaf', 'device')
        ipcRenderer.send('nanoLeafDevice', ip)
    }
    else if(action === 'openWindow'){
        ipcRenderer.send('nanoLeaf', 'openWindow')
    }
}
function hueGetIDs() {
    ipcRenderer.send('getHueDevices')
}

function simulateGreen() {
    M.toast({
        html: 'Green flag event sent',
        displayLength: 2000
    })

    ipcRenderer.send('simulate', 'Green')
}
ipcRenderer.on('toaster', (event, arg) => {
    M.toast({
        html: arg,
        displayLength: 2000
    })
})

function simulateYellow() {
    M.toast({
        html: 'Yellow flag event sent',
        displayLength: 2000
    })

    ipcRenderer.send('simulate', 'Yellow')
}

function simulateRed() {
    M.toast({
        html: 'Red flag event sent',
        displayLength: 2000
    })

    ipcRenderer.send('simulate', 'Red')
}

function simulateSC() {
    M.toast({
        html: 'Safety car event sent',
        displayLength: 2000
    })

    ipcRenderer.send('simulate', 'SC')
}

function simulateVSC() {
    M.toast({
        html: 'VSC event sent',
        displayLength: 2000
    })

    ipcRenderer.send('simulate', 'VSC')
}

function simulateVSCEnding() {
    M.toast({
        html: 'VSC Ending event sent',
        displayLength: 2000
    })

    ipcRenderer.send('simulate', 'vscEnding')
}

function turnAllLightsOff() {
    M.toast({
        html: 'Turning all lights off...',
        displayLength: 2000
    })

    ipcRenderer.send('simulate', 'alloff')
}

function checkForUpdates() {
    M.toast({
        html: 'Checking for updates..',
        displayLength: 2000
    })

    ipcRenderer.send('updatecheck', 'updatecheck')
}

function openConfig() {
    M.toast({
        html: 'Opening config file...',
        displayLength: 2000
    })
    ipcRenderer.send('open-config')
}

function toggleDevTools() {
    ipcRenderer.send('toggle-devtools')
}

function toggleDebugMode() {
    ipcRenderer.send('toggle-debug')
}

function toggleF1MVApiCheck() {
    ipcRenderer.send('f1mv-check')
}

function toggleAutoDevToolsCheck() {
    ipcRenderer.send('auto-devtools')
}
function testButtonDev() {
    ipcRenderer.send('test-button-dev')
}
function testButtonTestMode() {
    ipcRenderer.send('test-button-test-mode')
}
function ikeaGetIds() {
    ipcRenderer.send('ikea-get-ids')
}
function sendConfig() {
    ipcRenderer.send('send-config')
}
function restartApp() {
    ipcRenderer.send('restart-app')
}