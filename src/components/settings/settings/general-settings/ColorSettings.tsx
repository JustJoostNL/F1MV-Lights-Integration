import React, { useEffect, useState } from "react";
import { RgbColorPicker } from "react-colorful";
import Typography from "@mui/material/Typography";
import { Box, MenuItem, Select } from "@mui/material";
import { Autocomplete, TextField } from "@mui/material";
import { settingBoxSX } from "@/components/settings/allSettings";

interface IColorSettings {
  [key: string]: string;
}

interface IFlagOption {
  label: string;
  value: string;
}

const flagNameMaps = {
  green: "Green",
  yellow: "Yellow",
  red: "Red",
  safetyCar: "Safety Car",
  vsc: "Virtual Safety Car",
  vscEnding: "Virtual Safety Car Ending",
  staticColor: "Static Color",
};

const flagDescriptionMaps = {
  green: "This is the color that will be used when the track status is green.",
  yellow: "This is the color that will be used when the track status is yellow.",
  red: "This is the color that will be used when the track status is red.",
  safetyCar: "This is the color that will be used when there is a safety car.",
  vsc: "This is the color that will be used when there is a virtual safety car.",
  vscEnding: "This is the color that will be used when the virtual safety car is ending.",
  staticColor: "This is the color that will be used when going back to the static color.",
};

const DEFAULT_FLAG = "green";

export default function ColorSettings() {
  const [settings, setSettings] = useState<IColorSettings | null>(null);
  const [selectedFlag, setSelectedFlag] = useState<string>(DEFAULT_FLAG);
  const flagOptions: IFlagOption[] = Object.keys(flagNameMaps).map((flagKey) => ({
    label: flagNameMaps[flagKey],
    value: flagKey,
  }));

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

  const handleFlagChange = (event: React.ChangeEvent<{}>, option: IFlagOption | null) => {
    if (option) {
      setSelectedFlag(option.value);
    }
  };

  return (
    <>
      {settings && (
        <div>
          <div>
            <Box sx={settingBoxSX}>
              <Typography variant="h6" component="div">
                Color Customization
              </Typography>
            </Box>
            <Autocomplete
              disablePortal={true}
              autoComplete={true}
              autoSelect={true}
              clearIcon={false}
              defaultValue={"green"}
              value={flagOptions.find((option: IFlagOption) => option.value === selectedFlag)}
              onChange={handleFlagChange}
              autoHighlight={true}
              id={"flag-selector"}
              sx={{ width: 300, mb: 2, mt: 1 }}
              renderInput={(params) => <TextField {...params} label="Select Flag" color={"secondary"} />}
              options={flagOptions}
            />
          </div>
          {selectedFlag && (
            <Box sx={settingBoxSX}>
              <div>
                <Typography variant="h6" component="div">
                  {flagNameMaps[selectedFlag]}
                </Typography>
                <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                  {flagDescriptionMaps[selectedFlag]}
                </Typography>
              </div>
              <RgbColorPicker
                color={settings[selectedFlag]}
                onChange={(color) => handleSetSingleSetting(selectedFlag, color)}
              />
            </Box>
          )}
        </div>
      )}
    </>
  );
}