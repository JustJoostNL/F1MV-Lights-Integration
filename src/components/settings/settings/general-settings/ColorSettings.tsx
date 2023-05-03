import React, {useEffect, useState} from "react";
import { RgbColorPicker } from "react-colorful";
import Typography from "@mui/material/Typography";
import {Box} from "@mui/material";
import {settingBoxSX} from "@/components/settings/allSettings";

export default function ColorSettings(){
  const [settings, setSettings] = useState<any | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      const config = await window.f1mvli.config.getAll();
      setSettings(config.Settings.generalSettings.colorSettings);
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
    await window.f1mvli.config.set("Settings.generalSettings.colorSettings", settings);
  }

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

  const settingNameMaps = {
    "staticColor": "Static Color",
    "green": "Green",
    "yellow": "Yellow",
    "red": "Red",
    "safetyCar": "Safety Car",
    "vsc": "Virtual Safety Car",
    "vscEnding": "Virtual Safety Car Ending",
  }

  const settingDescriptionMaps = {
    "staticColor": "This is the color that will be used when going back to the static color.",
    "green": "This is the color that will be used when the track status is green.",
    "yellow": "This is the color that will be used when the track status is yellow.",
    "red": "This is the color that will be used when the track status is red.",
    "safetyCar": "This is the color that will be used when there is a safety car.",
    "vsc": "This is the color that will be used when there is a virtual safety car.",
    "vscEnding": "This is the color that will be used when the virtual safety car is ending.",
  }


  return (
    <>
      {settings && (
        <div>
          {Object.keys(settings).map((setting: string) => (
            <Box sx={settingBoxSX}>
              <div>
                <Typography variant="h6" component="div">
                  {/* @ts-ignore*/}
                  {settingNameMaps[setting]}
                </Typography>
                <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                  {/* @ts-ignore*/}
                  {settingDescriptionMaps[setting]}
                </Typography>
              </div>
              <RgbColorPicker color={settings[setting]} onChange={(color) => handleSetSingleSetting(setting, color)} />
            </Box>
          ))}
        </div>
      )}
    </>
  )
}