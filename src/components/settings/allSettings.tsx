import {alpha, styled, Switch} from "@mui/material";
import {lightBlue} from "@mui/material/colors";
import GeneralSettingsContent from "@/components/settings/settings/general-settings/GeneralSettings";
import F1MVSettingsContent from "@/components/settings/settings/f1mv-settings/F1MVSettings";
import HueSettingsContent from "@/components/settings/settings/hue-settings/HueSettings";
import IkeaSettingsContent from "@/components/settings/settings/ikea-settings/IkeaSettings";
import GoveeSettingsContent from "@/components/settings/settings/govee-settings/GoveeSettings";
import OpenRGBSettingsContent from "@/components/settings/settings/openrgb-settings/OpenRGBSettings";
import HassSettingsContent from "@/components/settings/settings/hass-settings/HassSettings";
import NanoleafSettingsContent from "@/components/settings/settings/nanoleaf-settings/NanoleafSettings";
import WLEDSettingsContent from "@/components/settings/settings/wled-settings/WLEDSettings";
import YeelightSettingsContent from "@/components/settings/settings/yeelight-settings/YeelightSettings";
import ElgatoSDSettingsContent from "@/components/settings/settings/elgato-sd-settings/ElgatoSDSettings";
import DiscordSettingsContent from "@/components/settings/settings/discord-settings/DiscordSettings";
import WebServerSettingsContent from "@/components/settings/settings/webserver-settings/WebServerSettings";
import AdvancedSettingsContent from "@/components/settings/settings/advanced-settings/AdvancedSettings";

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
		content: <GeneralSettingsContent />,
		type: "general"
	},
	{
		heading: "F1MV Settings",
		content: <F1MVSettingsContent/>,
		type: "f1mv"
	},
	{
		heading: "Philips Hue Settings",
		content: <HueSettingsContent/>,
		type: "integration"
	},
	{
		heading: "Ikea Settings",
		content: <IkeaSettingsContent/>,
		type: "integration"
	},
	{
		heading: "Govee Settings",
		content: <GoveeSettingsContent/>,
		type: "integration"
	},
	{
		heading: "OpenRGB Settings",
		content: <OpenRGBSettingsContent/>,
		type: "integration"
	},
	{
		heading: "Home Assistant Settings",
		content: <HassSettingsContent/>,
		type: "integration"
	},
	{
		heading: "Nanoleaf Settings",
		content: <NanoleafSettingsContent/>,
		type: "integration"
	},
	{
		heading: "WLED Settings",
		content: <WLEDSettingsContent/>,
		type: "integration"
	},
	{
		heading: "YeeLight Settings",
		content: <YeelightSettingsContent/>,
		type: "integration"
	},
	{
		heading: "Elgato Stream Deck Settings",
		content:  <ElgatoSDSettingsContent/>,
		type: "integration"
	},
	{
		heading: "Discord Settings",
		content: <DiscordSettingsContent/>,
		type: "integration"
	},
	{
		heading: "Webserver Settings",
		content: <WebServerSettingsContent/>,
		type: "integration"
	},
	{
		heading: "Advanced Settings",
		content: <AdvancedSettingsContent/>,
		type: "advanced",
	},
];