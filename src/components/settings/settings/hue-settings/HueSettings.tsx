import React, {useEffect, useState} from "react";
import {BlueSwitch, settingBoxSX} from "@/components/settings/allSettings";
import {Alert, Box, TextField, Typography} from "@mui/material";
import HueMenu from "@/components/settings/settings/hue-settings/HueMenu";
import { useHotkeys } from "react-hotkeys-hook";
import Toaster from "@/components/toaster/Toaster";
import Divider from "@mui/material/Divider";

export default function HueSettingsContent() {
	const [settings, setSettings] = useState<any | null>(null);
	const [hueAdvancedSettings, setHueAdvancedSettings] = useState(false);

	// for the user to show the custom IP setting, he just needs to do a little secret trick, just needs to do ctrl+shift+h

	useHotkeys("shift+a+1", () => {
		setHueAdvancedSettings(!hueAdvancedSettings);
	});


	useEffect(() => {
		async function fetchConfig() {
			const config = await window.f1mvli.config.getAll();
			setSettings(config.Settings.hueSettings);
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
		await window.f1mvli.config.set("Settings.hueSettings", settings);
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
                                Disable Philips Hue Integration
							</Typography>
							<Typography variant="body2" component="div" sx={{color: "grey"}}>
                                This will disable the Philips Hue integration, enable this if you don't have Hue devices.
							</Typography>
						</div>
						<BlueSwitch
							id="disable-hue-switch"
							checked={settings.hueDisable}
							onChange={(event) => {
								handleSetSingleSetting("hueDisable", event.target.checked);
							}}
						/>
					</Box>
					<>
						{hueAdvancedSettings && !settings.hueDisable && (
							<>
								<>
									<Divider sx={{mb: "20px"}}/>
									<Toaster message={"Hue advanced settings are now visible!"} severity={"info"} time={3000}/>
								</>
								<Alert sx={{mb: "20px", mr: "650px"}} severity="warning">Please do not change these settings unless you know what you're doing!!</Alert>
								<Box sx={settingBoxSX}>
									<div>
										<Typography variant="h6" component="div">
                                            Hue bridge IP
										</Typography>
										<Typography variant="body2" component="div" sx={{color: "grey"}}>
                                            If you know your Hue bridge IP, you can enter it here. If you don't know it, leave this blank, and it will be automatically detected.
										</Typography>
									</div>
									<TextField
										color="secondary"
										id="hue-bridge-ip"
										label="Hue bridge IP"
										variant="outlined"
										value={settings.hueBridgeIP}
										onChange={(event) => {
											handleSetSingleSetting("hueBridgeIP", event.target.value);
										}}
									/>
								</Box>
								<Box sx={settingBoxSX}>
									<div>
										<Typography variant="h6" component="div">
                                            Hue bridge token
										</Typography>
										<Typography variant="body2" component="div" sx={{color: "grey"}}>
                                            If you know your Hue bridge token, you can enter it here. If you don't know it, leave this blank, and it will be automatically generated.
										</Typography>
									</div>
									<TextField
										color="secondary"
										id="hue-bridge-token"
										label="Hue bridge token"
										variant="outlined"
										value={settings.token}
										onChange={(event) => {
											handleSetSingleSetting("token", event.target.value);
										}}
									/>
								</Box>
								<Divider sx={{mb: "20px"}}/>
							</>)}
						<>
							{!settings.hueDisable && (
								<>
									<Box sx={settingBoxSX}>
										<div>
											<Typography variant="h6" component="div">
                                                Hue 3rd party compatibility mode
											</Typography>
											<Typography variant="body2" component="div" sx={{color: "grey"}}>
                                                Enable this if the 3rd party devicess connected to your Hue bridge are not working correctly.
											</Typography>
										</div>
										<BlueSwitch
											id="hue-3rd-party-compat-mode-switch"
											checked={settings.hue3rdPartyCompatMode}
											onChange={(event) => {
												handleSetSingleSetting("hue3rdPartyCompatMode", event.target.checked);
											}}
										/>
									</Box>
									<Box sx={settingBoxSX}>
										<div>
											<Typography variant="h6" component="div">
                                                Enable fade
											</Typography>
											<Typography variant="body2" component="div" sx={{color: "grey"}}>
                                                Enable this if you want your Hue devices to fade to the new color instead of instantly changing.
											</Typography>
										</div>
										<BlueSwitch
											id="hue-3rd-party-fade-switch"
											checked={settings.enableFade}
											onChange={(event) => {
												handleSetSingleSetting("enableFade", event.target.checked);
											}}
										/>
									</Box>
									<Box sx={settingBoxSX}>
										<div>
											<Typography variant="h6" component="div">
												Enable fade for effects
											</Typography>
											<Typography variant="body2" component="div" sx={{color: "grey"}}>
												Enable this if you want your Hue devices to fade to the new color when an effect is active instead of instantly changing.
											</Typography>
										</div>
										<BlueSwitch
											id="hue-3rd-party-fade-with-effects-switch"
											checked={settings.enableFadeWithEffects}
											onChange={(event) => {
												handleSetSingleSetting("enableFadeWithEffects", event.target.checked);
											}}
										/>
									</Box>
									<Divider sx={{mb: "20px"}}/>
									<Box sx={settingBoxSX}>
										<div>
											<HueMenu/>
										</div>
									</Box>
								</>
							)}
						</>
					</>
				</div>
			)}
		</>
	);
}