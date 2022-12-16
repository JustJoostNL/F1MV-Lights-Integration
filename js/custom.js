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

    ipcRenderer.on('settings', (event, arg) => {
        // search in the settings.html for the id 'brightness-input' and set the value to the defaultBrightness
        $('#brightness-input').val(arg.Settings.generalSettings.defaultBrightness)
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
function ikeagetids() {
    ipcRenderer.send('ikea-get-ids')
}
function sendConfig() {
    setTimeout(() => {
        ipcRenderer.send('send-config')
    }, 1000)
}