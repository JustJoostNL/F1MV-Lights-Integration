import React, {useEffect, useState} from "react";
import {Box, TextField, Typography} from "@mui/material";
import {BlueSwitch, settingBoxSX} from "@/components/settings/allSettings";
import Divider from "@mui/material/Divider";

export default function OpenRGBSettingsContent() {
	const [settings, setSettings] = useState<any | null>(null);


	useEffect(() => {
		async function fetchConfig() {
			const config = await window.f1mvli.config.getAll();
			setSettings(config.Settings.openRGBSettings);
		}
		fetchConfig();
	}, []);

	const handleSetSingleSetting = (setting: string, value: any) => {
		if (typeof value === "string" && value.match(/^[0-9]+$/)) {
			value = parseInt(value);
		}
		setSettings({
			...settings,
			[setting]: value,
		});
	};

	const saveConfig = async () => {
		if (!settings) return;
		await window.f1mvli.config.set("Settings.openRGBSettings", settings);
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
                                Disable OpenRGB Integration
							</Typography>
							<Typography variant="body2" component="div" sx={{color: "grey"}}>
                                This will disable the OpenRGB integration, enable this if you don't have OpenRGB devices.
							</Typography>
						</div>
						<BlueSwitch
							id="disable-openrgb-switch"
							checked={settings.openRGBDisable}
							onChange={(event) => {
								handleSetSingleSetting("openRGBDisable", event.target.checked);
							}}
						/>
					</Box>
					<>
						{!settings.openRGBDisable && (
							<>
								<Divider sx={{mb: "20px"}}/>
								<Box sx={settingBoxSX}>
									<div>
										<Typography variant="h6" component="div">
                                        OpenRGB Server IP
										</Typography>
										<Typography variant="body2" component="div" sx={{color: "grey"}}>
                                        This is the hostname or IP of the system OpenRGB is running on. (default is localhost)
										</Typography>
									</div>
									<TextField
										color="secondary"
										id="openrgb-server-ip-input"
										label="OpenRGB Server IP"
										variant="outlined"
										value={settings.openRGBServerIP}
										onChange={(event) => {
											handleSetSingleSetting("openRGBServerIP", event.target.value);
										}}
									/>
								</Box>
								<Box sx={settingBoxSX}>
									<div>
										<Typography variant="h6" component="div">
                                        OpenRGB Server Port
										</Typography>
										<Typography variant="body2" component="div" sx={{color: "grey"}}>
                                        This is the port of the OpenRGB server, you can find this port in the "SDK Server" tab in the OpenRGB software. (default is 6742)
										</Typography>
									</div>
									<TextField
										color="secondary"
										id="openrgb-server-port-input"
										label="OpenRGB Server Port"
										variant="outlined"
										value={settings.openRGBServerPort}
										onChange={(event) => {
											handleSetSingleSetting("openRGBServerPort", event.target.value);
										}}
									/>
								</Box>
							</>
						)}
					</>
				</div>
			)}
		</>
	);
}