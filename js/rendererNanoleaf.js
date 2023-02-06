import {ipcRenderer} from "electron";

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