import {alpha, styled, Switch} from "@mui/material";
import {lightBlue} from "@mui/material/colors";
import GeneralSettingsContent from "@/components/settings/settings/general-settings/GeneralSettings";
import F1MVSettingsContent from "@/components/settings/settings/f1mv-settings/F1MVSettings";
import HueSettingsContent from "@/components/settings/settings/hue-settings/HueSettings";

export const BlueSwitch = styled(Switch)(({ theme }) => ({
	"& .MuiSwitch-switchBase.Mui-checked": {
		color: lightBlue[200],
		"&:hover": {
			backgroundColor: alpha(lightBlue[200], theme.palette.action.hoverOpacity),
		},
	},
	"& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
		backgroundColor: lightBlue[200],
	},
}));

export const settingBoxSX = {
	display: "flex",
	justifyContent: "space-between",
	width: "100%",
	color: "white",
	textAlign: "left",
	marginBottom: "20px",
	marginRight: "600px"
};

const ipsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas laoreet, diam vel facilisis vehicula, massa metus facilisis nibh, sit amet commodo erat leo vel lacus.";

export const allSettings = [
	{
		heading: "General Settings",
		content: <GeneralSettingsContent />
	},
	{
		heading: "F1MV Settings",
		content: <F1MVSettingsContent/>
	},
	{
		heading: "Philips Hue Settings",
		content: <HueSettingsContent/>
	},
	{
		heading: "Ikea Settings",
		content: ipsum
	},
	{
		heading: "Govee Settings",
		content: ipsum
	},
	{
		heading: "OpenRGB Settings",
		content: ipsum
	},
	{
		heading: "Home Assistant Settings",
		content: ipsum
	},
	{
		heading: "Nanoleaf Settings",
		content: ipsum
	},
	{
		heading: "WLED Settings",
		content: ipsum
	},
	{
		heading: "YeeLight Settings",
		content: ipsum
	},
	{
		heading: "Elgato Stream Deck Settings",
		content:  ipsum
	},
	{
		heading: "Discord Settings",
		content: ipsum
	},
	{
		heading: "Webserver Settings",
		content: ipsum
	},
	{
		heading: "Advanced Settings",
		disabled: true
	},
];