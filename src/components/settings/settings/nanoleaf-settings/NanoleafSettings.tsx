import React, {useEffect, useState} from "react";
import {Box, Typography} from "@mui/material";
import {BlueSwitch, settingBoxSX} from "@/components/settings/allSettings";
import HueMenu from "@/components/settings/settings/hue-settings/HueMenu";
import NanoleafMenu from "@/components/settings/settings/nanoleaf-settings/NanoleafMenu";

export default function NanoleafSettingsContent() {
	const [settings, setSettings] = useState<any | null>(null);


	useEffect(() => {
		async function fetchConfig() {
			const config = await window.f1mvli.config.getAll();
			setSettings(config.Settings.nanoLeafSettings);
		}
		fetchConfig();
	}, []);

	const handleSetSingleSetting = (setting: string, value: any) => {
		setSettings({
			...settings,
			[setting]: value,
		});
	};

	const saveConfig = async () => {
		if (!settings) return;
		await window.f1mvli.config.set("Settings.nanoLeafSettings", settings);
	};

	useEffect(() => {
		const handleUnload = async () => {
			await saveConfig();
		};

		window.addEventListener("unload", handleUnload);

		return () => {
			window.removeEventListener("unload", handleUnload);
			saveConfig();
		};
	}, [saveConfig]);

	return (
		<>
			{settings && (
				<div>
					<Box sx={settingBoxSX}>
						<div>
							<Typography variant="h6" component="div">
                                Disable Nanoleaf Integration
							</Typography>
							<Typography variant="body2" component="div" sx={{color: "grey"}}>
                                This will disable the Nanoleaf integration, enable this if you don't have Nanoleaf devices.
							</Typography>
						</div>
						<BlueSwitch
							id="disable-govee-switch"
							checked={settings.nanoLeafDisable}
							onChange={(event) => {
								handleSetSingleSetting("nanoLeafDisable", event.target.checked);
							}}
						/>
					</Box>
					<>
						{!settings.nanoLeafDisable && (
							<Box sx={settingBoxSX}>
								<div>
									<NanoleafMenu/>
								</div>
							</Box>
						)}
					</>
				</div>
			)}
		</>
	);
}