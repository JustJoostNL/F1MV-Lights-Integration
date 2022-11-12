const { ipcRenderer } = require('electron');
let config = [];

$(function() {
    ipcRenderer.on('f1mvAPI', (event, arg) => {
        if (arg === 'online') {
            $('#f1mv').find('.status').removeClass('error').addClass('success')
        }

        if (arg === 'offline') {
            $('#f1mv').find('.status').removeClass('success').addClass('error')
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

    ipcRenderer.on('log', (event, arg) => {
        $('#log').prepend(`<p style="color: white;">[${new Date().toLocaleTimeString('en-GB', {hour12: false})}] ${arg}</p>`)
    })

    // receive the config-open event
    ipcRenderer.on('config', (event, arg) => {
        console.log('recieved config.')
        config = arg;

        console.log(1)
        config.YeeLights.lights.forEach(function(light) {
            console.log(light)

            $('#lights').append(`<div class="check" id="${light}"><span class="status error"></span><p>${light}</p></div>`)
        })
    })

    // TODO: Create event.
    ipcRenderer.on('lightchange', (event, arg) => {
       if (arg.status === 'online') {
            $(`#${arg.lightIP}`).find('.status').removeClass('error').addClass('success')
       }
       if (arg.status === 'offline') {
        $(`#${arg.lightIP}`).find('.status').removeClass('success').addClass('error')
   }
    })
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

    ipcRenderer.send('simulate', 'vcsEnding')
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
        html: 'Opening config file..',
        displayLength: 2000
    })
    ipcRenderer.send('open-config')
}

// html example for opening the config file
// <a class="waves-effect waves-light btn" onclick="openConfig()">Open config file</a>