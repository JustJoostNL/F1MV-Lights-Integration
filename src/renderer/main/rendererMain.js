const { ipcRenderer } = require('electron');
const startTime = new Date().getTime();
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

    ipcRenderer.on('streamDeckAPI', (event, arg) => {
        if (arg === 'online') {
            $('#streamDeckAPI').find('.status').removeClass('error').addClass('success')
        }

        if (arg === 'offline') {
            $('#streamDeckAPI').find('.status').removeClass('success').addClass('error')
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
    ipcRenderer.on('WLEDAPI', (event, arg) => {
        if (arg === 'online') {
            $('#WLEDAPI').find('.status').removeClass('error').addClass('success')
        }

        if (arg === 'offline') {
            $('#WLEDAPI').find('.status').removeClass('success').addClass('error')
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

    ipcRenderer.on('webServerAPI', (event, arg) => {
        if (arg === 'online') {
            $('#webServerAPI').find('.status').removeClass('error').addClass('success')
        }

        if (arg === 'offline') {
            $('#webServerAPI').find('.status').removeClass('success').addClass('error')
        }
    })

})

    ipcRenderer.on('log', (event, arg) => {
        if (new Date().getTime() - startTime < 2000) {
            setTimeout(() => {
                $('#log').prepend(`<p style="color: white;">[${new Date().toLocaleTimeString('en-GB', {hour12: false})}] ${arg}</p>`)
            }, 2000 - (new Date().getTime() - startTime))
        } else {
            $('#log').prepend(`<p style="color: white;">[${new Date().toLocaleTimeString('en-GB', {hour12: false})}] ${arg}</p>`)
        }
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
    ipcRenderer.on('f1mv-check-html', (event, arg) => {
        if (arg === true) {
            $('#f1mvSyncToggle').html('<em style="color:white" class="material-icons">toggle_on</em> Toggle F1MV Sync')
        } else if(arg === false) {
            $('#f1mvSyncToggle').html('<em style="color:white" class="material-icons">toggle_off</em> Toggle F1MV Sync')
        }
    })

    ipcRenderer.on('auto-devtools', (event, arg) => {
        // change the icon from code to code_off
        $('#dev').find('i').removeClass('code').addClass('code_off')
    })
    ipcRenderer.on('hide-disabled-integrations', (event, arg) => {
        if (arg.Settings.hueSettings.hueDisable) {
            $('#hueAPI').hide()
        } else {
            $('#hueAPI').show()
        }
        if(arg.Settings.yeeLightSettings.yeeLightDisable) {
            $('#yeelightAPI').hide()
        } else {
            $('#yeelightAPI').show()
        }
        if(arg.Settings.nanoLeafSettings.nanoLeafDisable) {
            $('#nanoLeafAPI').hide()
        } else {
            $('#nanoLeafAPI').show()
        }
        if(arg.Settings.WLEDSettings.WLEDDisable) {
            $('#WLEDAPI').hide()
        } else {
            $('#WLEDAPI').show()
        }
        if(arg.Settings.openRGBSettings.openRGBDisable) {
            $('#openRGBAPI').hide()
        } else {
            $('#openRGBAPI').show()
        }
        if(arg.Settings.goveeSettings.goveeDisable) {
            $('#goveeAPI').hide()
        } else {
            $('#goveeAPI').show()
        }
        if(arg.Settings.ikeaSettings.ikeaDisable) {
            $('#ikeaAPI').hide()
        } else {
            $('#ikeaAPI').show()
        }
        if(arg.Settings.streamDeckSettings.streamDeckDisable) {
            $('#streamDeckAPI').hide()
        } else {
            $('#streamDeckAPI').show()
        }
        if(arg.Settings.webServerSettings.webServerDisable) {
            $('#webServerAPI').hide()
        } else {
            $('#webServerAPI').show()
        }
    })
ipcRenderer.on('hide-logs', (event, arg) => {
    if (arg === true) {
        $('#logs').hide()

    } else if(arg === false) {
        $('#logs').show()
    }
})

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
function hideDisabledIntegrations(){
    ipcRenderer.send('hide-disabled-integrations')
}
function toggleLogs(){
    ipcRenderer.send('toggle-logs')
}
function checkAPIS(){
    ipcRenderer.send('check-apis')
}
function loadPrefs(){
    ipcRenderer.send('load-prefs')
}