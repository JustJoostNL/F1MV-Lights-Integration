import { alpha, styled, Switch } from "@mui/material";
import { lightBlue } from "@mui/material/colors";
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

export const allSettings = [
  {
    heading: "General Settings",
    content: <GeneralSettingsContent />,
    description: "Settings related to F1MV Lights Integration",
    type: "general"
  },
  {
    heading: "F1MV Settings",
    content: <F1MVSettingsContent/>,
    description: "Settings related to MultiViewer",
    type: "f1mv"
  },
  {
    heading: "Philips Hue",
    content: <HueSettingsContent/>,
    description: "Disable Hue Integration — Hue 3rd party compatibility mode — Enable fade — Enable fade for effects — Hue Tools",
    type: "integration"
  },
  {
    heading: "IKEA",
    content: <IkeaSettingsContent/>,
    description: "Disable Ikea Integration — Ikea Gateway Security Code — Ikea Tools",
    type: "integration"
  },
  {
    heading: "Govee",
    content: <GoveeSettingsContent/>,
    description: "Disable Govee Integration",
    type: "integration"
  },
  {
    heading: "OpenRGB",
    content: <OpenRGBSettingsContent/>,
    description: "Disable OpenRGB Integration — OpenRGB Server IP — OpenRGB Server Port",
    type: "integration"
  },
  {
    heading: "Home Assistant",
    content: <HassSettingsContent/>,
    description: "Disable Home Assistant Integration — Home Assistant IP — Home Assistant Port — Home Assistant API Token — Home Assistant Tools",
    type: "integration"
  },
  {
    heading: "Nanoleaf",
    content: <NanoleafSettingsContent/>,
    description: "Disable Nanoleaf Integration — Nanoleaf Tools",
    type: "integration"
  },
  {
    heading: "WLED",
    content: <WLEDSettingsContent/>,
    description: "Disable WLED Integration — WLED Tools",
    type: "integration"
  },
  {
    heading: "YeeLight",
    content: <YeelightSettingsContent/>,
    description: "Disable YeeLight Integration — YeeLight Tools",
    type: "integration"
  },
  {
    heading: "Elgato Stream Deck",
    content:  <ElgatoSDSettingsContent/>,
    description: "Disable the Elgato Stream Deck Integration",
    type: "integration"
  },
  {
    heading: "Discord",
    content: <DiscordSettingsContent/>,
    description: "Disable Discord Rich Presence Integration",
    type: "integration"
  },
  {
    heading: "Webserver",
    content: <WebServerSettingsContent/>,
    description: "Disable the Webserver — Webserver Port",
    type: "integration"
  },
  {
    heading: "Advanced Settings",
    content: <AdvancedSettingsContent/>,
    description: "More advanced settings, meant for developers/experts.",
    type: "advanced",
  },
];


//config
let receivedConfig: any = null;

async function fetchConfig() {
  receivedConfig = await window.f1mvli.config.getAll();
}
fetchConfig();

export async function getConfig() {
  return receivedConfig;
}

export async function refreshConfig() {
  await fetchConfig();
}

export const handleSetSingleSetting = (setting: string, value: any, setSettings: any, settings: any) => {
  if (typeof value === "string" && value.match(/^[0-9]+$/)) {
    value = parseInt(value);
  }
  setSettings({
    ...settings,
    [setting]: value,
  });
};