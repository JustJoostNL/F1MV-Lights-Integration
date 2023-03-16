const { ipcRenderer } = require("electron");

$(function() {
	ipcRenderer.on("hueAllInformation", (event, arg) => {
		const hueSelectedEntertainmentZones = arg.hueSelectedEntertainmentZones;
		const hueEntertainmentZonesInformation = arg.entertainmentZoneInformation;

		hueEntertainmentZonesInformation.forEach((zone) => {
			const zoneName = zone.name;
			const zoneId = zone.id;

			const newRow = document.createElement("tr");

			// create a new cell for the zone name
			const zoneNameCell = document.createElement("td");
			zoneNameCell.innerHTML = zoneName;
			zoneNameCell.style.color = "white";
			newRow.appendChild(zoneNameCell);

			// create a new cell for the zone id
			const zoneIdCell = document.createElement("td");
			zoneIdCell.innerHTML = zoneId;
			zoneIdCell.style.color = "white";
			newRow.appendChild(zoneIdCell);

			// also we create a checkbox for each zone
			// we need to create a label, then an input, then a span
			const zoneCheckboxCell = document.createElement("td");
			const zoneCheckboxLabel = document.createElement("label");
			const zoneCheckboxInput = document.createElement("input");
			const zoneCheckboxSpan = document.createElement("span");
			// set the attributes for the input
			zoneCheckboxInput.setAttribute("type", "checkbox");
			zoneCheckboxInput.setAttribute("class", "filled-in");
			// add the input and span to the label
			zoneCheckboxLabel.appendChild(zoneCheckboxInput);
			zoneCheckboxLabel.appendChild(zoneCheckboxSpan);
			// add the label to the cell
			zoneCheckboxCell.appendChild(zoneCheckboxLabel);
			// add the cell to the row
			newRow.appendChild(zoneCheckboxCell);

			// add the row to the table
			document.getElementById("hue-zone-table").appendChild(newRow);

			// now we need to check the boxes for the zones that are already selected
			hueSelectedEntertainmentZones.forEach((zone) => {
				// get the device ID
				const deviceID = zone;
				// get the table
				const table = document.getElementById("hue-zone-table");
				// get the rows
				const rows = table.getElementsByTagName("tr");
				// loop through the rows
				for (let i = 0; i < rows.length; i++) {
					// get the cells
					const cells = rows[i].getElementsByTagName("td");
					// get the zone ID cell
					const zoneIDCell = cells[1];
					// get the zone ID
					const zoneIDInCell = zoneIDCell.innerHTML;
					// check if the zone ID in the cell is the same as the device ID we are looking for
					if (zoneIDInCell === deviceID) {
						// get the checkbox cell
						const checkboxCell = cells[4];
						// get the checkbox input
						const checkboxInput = checkboxCell.getElementsByTagName("input")[0];
						// check the checkbox
						checkboxInput.checked = true;
					}
				}
			});
		});
	});
});

function saveSelectedEntertainmentZones() {
	// get the table
	const table = document.getElementById("hue-zone-table");
	// get the rows
	const rows = table.getElementsByTagName("tr");
	// create an array to store the selected devices
	const selectedZones = [];
	// loop through the rows
	for (let i = 0; i < rows.length; i++) {
		// get the cells
		const cells = rows[i].getElementsByTagName("td");
		// get the zone ID cell
		const zoneIDCell = cells[1];
		// get the zone ID
		const zoneID = zoneIDCell.innerHTML;
		// get the checkbox cell
		const checkboxCell = cells[2];
		// get the checkbox input
		const checkboxInput = checkboxCell.getElementsByTagName("input")[0];
		// check if the checkbox is checked
		if (checkboxInput.checked) {
			// add the device ID to the array
			selectedZones.push(zoneID);
		}
	}
	ipcRenderer.send("hueSelectorSaveSelectedEntertainmentZones", selectedZones);
}