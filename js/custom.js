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

        $('#govee-dis-devices-input').val(arg.Settings.goveeSettings.devicesDisabledIPs)

        if (arg.Settings.yeeLightSettings.yeeLightDisable) {
            $('#disable-yeelight-setting').attr('checked', 'checked')
        }else if (!arg.Settings.yeeLightSettings.yeeLightDisable) {
            $('#disable-yeelight-setting').removeAttr('checked')
        }

        $('#yeelight-device-ip-input').val(arg.Settings.yeeLightSettings.deviceIPs)

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

    ipcRenderer.on('auto-devtools', (event, arg) => {
        // change the icon from code to code_off
        $('#dev').find('i').removeClass('code').addClass('code_off')
    })

function saveConfig() {
    ipcRenderer.send('saveConfig', {
        defaultBrightness: $('#brightness-input').val(),
        autoTurnOffLights: $('#auto-turn-off-setting').is(':checked'),
        liveTimingURL: $('#live-timing-url-input').val(),
        ikeaDisable: $('#disable-ikea-setting').is(':checked'),
        securityCode: $('#sec-code-input').val(),
        deviceIDs: $('#devices-input').val(),
        goveeDisable: $('#disable-govee-setting').is(':checked'),
        devicesDisabledIPs: $('#govee-dis-devices-input').val(),
        yeeLightDisable: $('#disable-yeelight-setting').is(':checked'),
        deviceIPs: $('#yeelight-device-ip-input').val(),
        updateChannel: $('#update-channel-setting').val(),
        analytics: $('#analytics-setting').is(':checked'),
        debugMode: $('#debug-mode-setting').is(':checked')
    })
}

function simulateGreen() {
    M.toast({
        html: 'Green flag event sent',
        displayLength: 2000
    })

    ipcRenderer.send('simulate', 'Green')
}

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
function testButton() {
    ipcRenderer.send('test-button')
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