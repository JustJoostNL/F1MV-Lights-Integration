const { ipcRenderer } = require('electron');

$(function() {
    ipcRenderer.on('hueAllInformation', (event, arg) => {
        const hueSelectedDevices = arg.hueSelectedDevices
        const hueDeviceInformation = arg.deviceInformation;

        hueDeviceInformation.forEach((device) => {
            const deviceName = device.name;
            const deviceID = device.id;
            const deviceState = device.state;

            // create a new row
            const newRow = document.createElement('tr');

            // create a new cell for the device name
            const deviceNameCell = document.createElement('td');
            deviceNameCell.innerHTML = deviceName;
            deviceNameCell.style.color = 'white';
            newRow.appendChild(deviceNameCell);

            // create a new cell for the device ID
            const deviceIDCell = document.createElement('td');
            deviceIDCell.innerHTML = deviceID;
            deviceIDCell.style.color = 'white';
            newRow.appendChild(deviceIDCell);

            // create a new cell for the device state
            const deviceStateCell = document.createElement('td');
            deviceStateCell.innerHTML = deviceState;
            deviceStateCell.style.color = 'white';
            newRow.appendChild(deviceStateCell);

            // also we create a checkbox for each device
            // we need to create a label, then an input, then a span
            const deviceCheckboxCell = document.createElement('td');
            const deviceCheckboxLabel = document.createElement('label');
            const deviceCheckboxInput = document.createElement('input');
            const deviceCheckboxSpan = document.createElement('span');
            // set the attributes for the input
            deviceCheckboxInput.setAttribute('type', 'checkbox');
            deviceCheckboxInput.setAttribute('class', 'filled-in');
            // add the input and span to the label
            deviceCheckboxLabel.appendChild(deviceCheckboxInput);
            deviceCheckboxLabel.appendChild(deviceCheckboxSpan);
            // add the label to the cell
            deviceCheckboxCell.appendChild(deviceCheckboxLabel);
            // add the cell to the row
            newRow.appendChild(deviceCheckboxCell);


            // add the new row to the table
            document.getElementById('hue-device-table').appendChild(newRow);
        });

        hueSelectedDevices.forEach((device) => {
            // get the device ID
            const deviceID = device
            // get the table
            const table = document.getElementById("hue-device-table");
            // get the rows
            const rows = table.getElementsByTagName('tr');
            // loop through the rows
            for (let i = 0; i < rows.length; i++) {
                // get the cells
                const cells = rows[i].getElementsByTagName('td');
                // get the device ID cell
                const deviceIDCell = cells[1];
                // get the device ID
                const deviceIDInCell = deviceIDCell.innerHTML;
                // check if the device ID in the cell is the same as the device ID we are looking for
                if (deviceIDInCell === deviceID) {
                    // get the checkbox cell
                    const checkboxCell = cells[3];
                    // get the checkbox input
                    const checkboxInput = checkboxCell.getElementsByTagName('input')[0];
                    // check the checkbox
                    checkboxInput.checked = true;
                }
            }
        })
    })
})

function saveSelectedDevices() {
    // get the table
    const table = document.getElementById('hue-device-table');
    // get the rows
    const rows = table.getElementsByTagName('tr');
    // create an array to store the selected devices
    const selectedDevices = [];
    // loop through the rows
    for (let i = 0; i < rows.length; i++) {
        // get the cells
        const cells = rows[i].getElementsByTagName('td');
        // get the device ID cell
        const deviceIDCell = cells[1];
        // get the device ID
        const deviceID = deviceIDCell.innerHTML;
        // get the checkbox cell
        const checkboxCell = cells[3];
        // get the checkbox input
        const checkboxInput = checkboxCell.getElementsByTagName('input')[0];
        // check if the checkbox is checked
        if (checkboxInput.checked) {
            // add the device ID to the array
            selectedDevices.push(deviceID);
        }
    }
    ipcRenderer.send('hueSelectorSaveSelectedDevices', selectedDevices);
}