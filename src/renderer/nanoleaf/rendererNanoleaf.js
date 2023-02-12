const { ipcRenderer } = require('electron')

ipcRenderer.on('log', (event, arg) => {
    $('#log').prepend(`<p style="color: white;">[${new Date().toLocaleTimeString('en-GB', {hour12: false})}] ${arg}</p>`)
})

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