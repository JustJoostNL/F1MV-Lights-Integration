import React from "react";
import NavBar from "@/components/navbar";
import SettingsPage from "@/components/settings";

function Settings() {

	return (
		<div>
			<NavBar showSettingsBackButton={true} />
			<SettingsPage />
		</div>
	);
}

export default Settings;