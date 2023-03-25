import React, {useState} from "react";
import { BlueSwitch, settingBoxSX } from "@/components/settings/allSettings";
import {Box, Checkbox, FormControlLabel, FormGroup, TextField, Typography, Divider} from "@mui/material";
import { BrightnessSlider } from "@/components/settings/settings/generalSettings/slider";
import {useEffect} from "react";
import defaultConfig from "../../../../../electron/main/config/defaultConfig";


export default function GeneralSettingsContent() {
	const [settings, setSettings] = useState(defaultConfig.Settings.generalSettings);

	useEffect(() => {
		loadConfig();
	}, []);

	const loadConfig = () => {
		window.f1mvli.config.getAll().then((config) => {
			console.log(config);
			setSettings(config.Settings.generalSettings);
			console.log("Config loaded!" + "new config: " + settings);
		});
	};

	// useEffect(() => {
	// 	const handleUnload = () => {
	// 		window.f1mvli.config.set("Settings.generalSettings", settings);
	// 		console.log("Config saved!");
	// 	};
	//
	// 	window.addEventListener("beforeunload", handleUnload);
	//
	// 	return () => {
	// 		window.removeEventListener("beforeunload", handleUnload);
	// 	};
	// }, [settings]);


	return (
		<div>
			<Box sx={settingBoxSX}>
				<div>
					<Typography variant="h6" component="div">
						Automatically turn off lights when the session has ended
					</Typography>
					<Typography variant="body2" component="div" sx={{ color: "grey" }}>
						This will automatically turn off all lights when the session has ended.
					</Typography>
				</div>
				<BlueSwitch
					id="auto-turn-off-lights-switch"
					defaultChecked={settings.autoTurnOffLights}
				/>
			</Box>
			<Box sx={settingBoxSX}>
				<div>
					<Typography variant="h6" component="div">
						Default brightness
					</Typography>
					<Typography variant="body2" component="div" sx={{ color: "grey" }}>
						This is the brightness the lights will have, the maximum brightness is 100.
					</Typography>
				</div>
				<BrightnessSlider
					id="default-bri-slider"
					value={settings.defaultBrightness}
				/>
			</Box>
			<Divider sx={{ mb: "20px"}} />
			<Box sx={settingBoxSX}>
				<div>
					<Typography variant="h6" component="div">
                        Go back to static
					</Typography>
					<Typography variant="body2" component="div" sx={{ color: "grey" }}>
                        Automatically go back to a (customizable) static color after a (customizable) amount of time.
					</Typography>
				</div>
				<BlueSwitch
					id="go-back-to-static-switch"
					defaultChecked={settings.goBackToStatic}
				/>
			</Box>
			<Box sx={settingBoxSX}>
				<div>
					<Typography variant="h6" component="div">
                        Go back to static delay
					</Typography>
					<Typography variant="body2" component="div" sx={{ color: "grey" }}>
                        This is the delay in seconds before the lights go back to a static color.
					</Typography>
				</div>
				<TextField
					color="secondary"
					id="go-back-to-static-delay"
					label="Delay in seconds"
					variant="outlined"
					value={settings.goBackToStaticDelay}
				/>
			</Box>
			<Box sx={settingBoxSX}>
				<div>
					<Typography variant="h6" component="div">
                        Go back to static brightness
					</Typography>
					<Typography variant="body2" component="div" sx={{ color: "grey" }}>
                        This is the brightness the lights will have when they go back to a static color.
					</Typography>
				</div>
				<BrightnessSlider
					id= "go-back-to-static-bri-slider"
					value= {settings.staticBrightness}
				/>
			</Box>
			<Box sx={settingBoxSX}>
				<div>
					<Typography variant="h6" component="div">
                        Go back to static enabled flags
					</Typography>
					<Typography variant="body2" component="div" sx={{ color: "grey" }}>
                        Only on these flags the lights will go back to a static color.
					</Typography>
				</div>
				<FormGroup>
					<FormControlLabel control={<Checkbox color="secondary" id="go-back-to-static-flag-green" defaultChecked />} label="Green" />
				</FormGroup>
				<FormGroup>
					<FormControlLabel control={<Checkbox color="secondary" id="go-back-to-static-flag-yellow" defaultChecked />} label="Yellow" />
				</FormGroup>
				<FormGroup>
					<FormControlLabel control={<Checkbox color="secondary" id="go-back-to-static-flag-red" defaultChecked />} label="Red" />
				</FormGroup>
				<FormGroup>
					<FormControlLabel control={<Checkbox color="secondary" id="go-back-to-static-flag-safety-car" defaultChecked />} label="Safety Car" />
				</FormGroup>
				<FormGroup>
					<FormControlLabel control={<Checkbox color="secondary" id="go-back-to-static-flag-vsc" defaultChecked />} label="VSC" />
				</FormGroup>
				<FormGroup>
					<FormControlLabel control={<Checkbox color="secondary" id="go-back-to-static-flag-vsc-ending" defaultChecked />} label="VSC Ending" />
				</FormGroup>
			</Box>
		</div>
	);
}

