const { ipcRenderer } = require('electron')


$(function() {
    ipcRenderer.on('settings', (event, arg) => {

        if(arg.Settings.nanoLeafSettings.devices.length === 0){
            $('#nanoleaf-lights').append(`<div class="check"<p>No connected Nanoleaf devices found</p></div>`).show()
        } else if(arg.Settings.nanoLeafSettings.devices.length > 0){
            arg.Settings.nanoLeafSettings.devices.forEach(function(light) {
                $('#nanoleaf-lights').append(`<div class="check" id="${light.host}"><span class="status success"></span><p>${light.host}</p></div>`)
            })
            $('#nanoleaf-lights').show();
        }


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
        $('#hue-devices-input').val(arg.Settings.hueSettings.deviceIDs)

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

        if (arg.Settings.streamDeckSettings.streamDeckDisable) {
            $('#disable-stream-deck-setting').attr('checked', 'checked')
        }else if (!arg.Settings.streamDeckSettings.streamDeckDisable) {
            $('#disable-stream-deck-setting').removeAttr('checked')
        }

        if (arg.Settings.discordSettings.discordRPCDisable) {
            $('#disable-discord-rpc-setting').attr('checked', 'checked')
        }else if (!arg.Settings.discordSettings.discordRPCDisable) {
            $('#disable-discord-rpc-setting').removeAttr('checked')
        }

        $('#openrgb-ip-input').val(arg.Settings.openRGBSettings.openRGBServerIP)
        $('#openrgb-port-input').val(arg.Settings.openRGBSettings.openRGBServerPort)

        $('#webserver-port-input').val(arg.Settings.webServerSettings.webServerPort)

        if (arg.Settings.webServerSettings.webServerDisable) {
            $('#disable-webserver-setting').attr('checked', 'checked')
        }else if (!arg.Settings.webServerSettings.webServerDisable) {
            $('#disable-webserver-setting').removeAttr('checked')
        }
    })


})

function saveConfig() {
    ipcRenderer.send('saveConfig', {
        defaultBrightness: $('#brightness-input').val(),
        autoTurnOffLights: $('#auto-turn-off-setting').is(':checked'),
        liveTimingURL: $('#live-timing-url-input').val(),
        hueDisable: $('#disable-hue-setting').is(':checked'),
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
        streamDeckDisable: $('#disable-stream-deck-setting').is(':checked'),
        deviceIPs: $('#yeelight-device-ip-input').val(),
        discordRPCSetting: $('#disable-discord-rpc-setting').is(':checked'),
        webServerPort: $('#webserver-port-input').val(),
        webServerDisable: $('#disable-webserver-setting').is(':checked'),
        updateChannel: $('#update-channel-setting').val(),
        analytics: $('#analytics-setting').is(':checked'),
        debugMode: $('#debug-mode-setting').is(':checked')
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

function ikeaGetIds() {
    ipcRenderer.send('ikea-get-ids')
}
function sendConfig() {
    ipcRenderer.send('send-config')
}
function reloadFromConfig(){
    ipcRenderer.send('reload-from-config')
}
function linkOpenRGB(){
    saveConfig()
    reloadFromConfig()
    ipcRenderer.send('link-openrgb')
}
function openConfig() {
    M.toast({
        html: 'Opening config file...',
        displayLength: 2000
    })
    ipcRenderer.send('open-config')
}