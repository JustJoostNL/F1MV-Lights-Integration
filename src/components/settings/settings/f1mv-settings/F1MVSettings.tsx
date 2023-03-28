import React, {useEffect, useState} from "react";
import {Box, TextField, Typography} from "@mui/material";
import {BlueSwitch, settingBoxSX} from "@/components/settings/allSettings";

export default function F1MVSettingsContent() {
	const [settings, setSettings] = useState<any | null>(null);

	useEffect(() => {
		async function fetchConfig() {
			const config = await window.f1mvli.config.getAll();
			setSettings(config.Settings.MultiViewerForF1Settings);
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
		await window.f1mvli.config.set("Settings.MultiViewerForF1Settings", settings);
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
                                Live Timing URL
							</Typography>
							<Typography variant="body2" component="div" sx={{color: "grey"}}>
                                This is the MultiViewer For F1 Live Timing URL.
							</Typography>
						</div>
						<TextField
							color="secondary"
							id="f1mv-live-timing-url"
							label="URL"
							variant="outlined"
							value={settings.liveTimingURL}
							onChange={(event) => {
								handleSetSingleSetting("liveTimingURL", event.target.value);
							}}
						/>
					</Box>
					<Box sx={settingBoxSX}>
						<div>
							<Typography variant="h6" component="div">
                                Sync with MultiViewer For F1
							</Typography>
							<Typography variant="body2" component="div" sx={{color: "grey"}}>
                                When disabled, the lights will not sync with the current status of the MultiViewer For F1 Live Timing.
							</Typography>
						</div>
						<BlueSwitch
							id="f1mv-sync-switch"
							checked={settings.f1mvCheck}
							onChange={(event) => {
								handleSetSingleSetting("f1mvCheck", event.target.checked);
							}}
						/>
					</Box>
				</div>
			)}
		</>
	);
}