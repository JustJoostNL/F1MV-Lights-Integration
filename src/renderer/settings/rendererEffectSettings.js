const { ipcRenderer } = require("electron");

$(function() {
	ipcRenderer.on("settings", (event, arg) => {
		const effectSettings = arg.Settings.generalSettings.effectSettings;
		// example data:
		// effectSettings: [
		//     {
		//         name: "VSC Ending Blink Effect",
		//         onFlag: "vscEnding",
		//         enabled: true,
		//         actions: [
		//             {
		//                 type: "on",
		//                 color: {
		//                     r: 0,
		//                     g: 255,
		//                     b: 0
		//                 },
		//                 brightness: 100,
		//             },
		//             {
		//                 type: "delay",
		//                 delay: 500,
		//             },
		//             {
		//                 type: "on",
		//                 color: {
		//                     r: 255,
		//                     g: 150,
		//                     b: 0
		//                 },
		//                 brightness: 100,
		//             },
		//             {
		//                 type: "delay",
		//                 delay: 500,
		//             }
		//         ],
		//         amount: 5
		//     }
		// ]

		// html:
		// <div className="container">
		//     <table className="table-devices-selector-style">
		//         <thead>
		//         <tr>
		//             <th style="color:white">Name</th>
		//             <th style="color:white">Flag</th>
		//             <th style="color:white">Amount of actions</th>
		//             <th style="color:white">Enabled</th>
		//             <th style="color:white">Edit</th>
		//         </tr>
		//         </thead>
		//         <tbody id="effects-table">
		//         <!-- start of table row -->
		//         </tbody>
		//     </table>
		// </div>

		for (let i = 0; i < effectSettings.length; i++) {
			const newRow = document.createElement("tr");
			newRow.style.color = "white";
			const name = document.createElement("td");
			const flag = document.createElement("td");
			const amount = document.createElement("td");
			const enabled = document.createElement("td");
			const edit = document.createElement("td");

			name.innerHTML = effectSettings[i].name;
			flag.innerHTML = flagNameReturner(effectSettings[i].onFlag);
			amount.innerHTML = effectSettings[i].actions.length;

			const effectCheckboxLabel = document.createElement("label");
			const effectCheckboxInput = document.createElement("input");
			const effectCheckboxSpan = document.createElement("span");
			effectCheckboxInput.setAttribute("type", "checkbox");
			effectCheckboxInput.setAttribute("class", "filled-in");
			effectCheckboxInput.setAttribute("id", "effect-checkbox-" + i);
			effectCheckboxInput.checked = effectSettings[i].enabled;
			effectCheckboxLabel.appendChild(effectCheckboxInput);
			effectCheckboxLabel.appendChild(effectCheckboxSpan);
			enabled.appendChild(effectCheckboxLabel);

			const editButton = document.createElement("button");
			editButton.setAttribute("class", "btn waves-effect waves-light");
			editButton.setAttribute("onclick", "editEffect('" + effectSettings[i].name + "')");
			editButton.innerHTML = "Edit";
			edit.appendChild(editButton);

			newRow.appendChild(name);
			newRow.appendChild(flag);
			newRow.appendChild(amount);
			newRow.appendChild(enabled);
			newRow.appendChild(edit);

			document.getElementById("effects-table").appendChild(newRow);
		}
	});
});


function sendConfig() {
	ipcRenderer.send("send-config");
}
function openConfig() {
	M.toast({
		html: "Opening config file...",
		displayLength: 2000
	});
	ipcRenderer.send("open-config");
}

function saveSelectedEffects() {
	const effects = document.getElementsByClassName("filled-in");
	const effectSettings = [];
	for (let i = 0; i < effects.length; i++) {
		// for each effect we get the name
		const effectName = effects[i].parentElement.parentElement.parentElement.children[0].innerHTML;
		effectSettings.push({
			name: effectName,
			enabled: effects[i].checked
		});
	}
	console.log(effectSettings);
	ipcRenderer.send("save-selected-effects", effectSettings);
}

function editEffect(effectName) {
	ipcRenderer.send("edit-effect", effectName);
}

function flagNameReturner(internalName){
	switch (internalName) {
	case "green":
		return "Green";
	case "red":
		return "Red";
	case "yellow":
		return "Yellow";
	case "vscEnding":
		return "VSC Ending";
	case "vsc":
		return "VSC";
	case "safetyCar":
		return "Safety Car";
	}
}