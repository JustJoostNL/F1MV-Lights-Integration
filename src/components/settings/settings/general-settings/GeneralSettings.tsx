import React, { useEffect, useState } from "react";
import { BlueSwitch, settingBoxSX } from "@/components/settings/allSettings";
import { Box, Checkbox, Divider, FormControlLabel, FormGroup, TextField, Typography } from "@mui/material";
import { BlueSlider } from "@/components/settings/BlueSlider";
import { HandleFlagChange } from "@/components/settings/settings/general-settings/HandleFlagChange";
import ColorSettings from "@/components/settings/settings/general-settings/ColorSettings";


export default function GeneralSettingsContent() {
  const [settings, setSettings] = useState<any | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      const config = await window.f1mvli.config.getAll();
      setSettings(config.Settings.generalSettings);
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
    await window.f1mvli.config.set("Settings.generalSettings", settings);
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
								Automatically turn off lights when the session has ended
              </Typography>
              <Typography variant="body2" component="div" sx={{ color: "grey" }}>
								This will automatically turn off all lights when the session has ended.
              </Typography>
            </div>
            <BlueSwitch
              id="auto-turn-off-lights-switch"
              checked={settings.autoTurnOffLights}
              onChange={(event) => {
                handleSetSingleSetting("autoTurnOffLights", event.target.checked);
              }}
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
            <BlueSlider
              id="default-bri-slider"
              value={settings.defaultBrightness}
              onChange= {(event, value) => {
                handleSetSingleSetting("defaultBrightness", value);
              }}
            />
          </Box>
          <Divider sx={{ mb: "20px" }}/>
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
              checked={settings.goBackToStatic}
              onChange={(event) => {
                handleSetSingleSetting("goBackToStatic", event.target.checked);
              }}
            />
          </Box>
          {settings.goBackToStatic && ( // render the following components only if goBackToStatic is true
            <>
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
                  onChange={(event) => {
                    handleSetSingleSetting("goBackToStaticDelay", event.target.value);
                  }}
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
                <BlueSlider
                  id="go-back-to-static-bri-slider"
                  value={settings.staticBrightness}
                  onChange= {(event, value) => {
                    handleSetSingleSetting("staticBrightness", value);
                  }}
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
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="secondary"
                        id={"go-back-to-static-flag-green"}
                        checked={settings.goBackToStaticEnabledFlags.includes("green")}
                        onChange={(event) => HandleFlagChange("green", event.target.checked, settings, setSettings)}
                      />
                    }
                    label={"Green"}
                  />
                </FormGroup>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="secondary"
                        id={"go-back-to-static-flag-yellow"}
                        checked={settings.goBackToStaticEnabledFlags.includes("yellow")}
                        onChange={(event) => HandleFlagChange("yellow", event.target.checked, settings, setSettings)}
                      />
                    }
                    label={"Yellow"}
                  />
                </FormGroup>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="secondary"
                        id={"go-back-to-static-flag-red"}
                        checked={settings.goBackToStaticEnabledFlags.includes("red")}
                        onChange={(event) => HandleFlagChange("red", event.target.checked, settings, setSettings)}
                      />
                    }
                    label={"Red"}
                  />
                </FormGroup>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="secondary"
                        id={"go-back-to-static-flag-safetyCar"}
                        checked={settings.goBackToStaticEnabledFlags.includes("safetyCar")}
                        onChange={(event) => HandleFlagChange("safetyCar", event.target.checked, settings, setSettings)}
                      />
                    }
                    label={"Safety Car"}
                  />
                </FormGroup>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="secondary"
                        id={"go-back-to-static-flag-vsc"}
                        checked={settings.goBackToStaticEnabledFlags.includes("vsc")}
                        onChange={(event) => HandleFlagChange("vsc", event.target.checked, settings, setSettings)}
                      />
                    }
                    label={"VSC"}
                  />
                </FormGroup>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="secondary"
                        id={"go-back-to-static-flag-vscEnding"}
                        checked={settings.goBackToStaticEnabledFlags.includes("vscEnding")}
                        onChange={(event) => HandleFlagChange("vscEnding", event.target.checked, settings, setSettings)}
                      />
                    }
                    label={"VSC Ending"}
                  />
                </FormGroup>
              </Box>
            </>)}
          <Divider sx={{ mb: "20px" }}/>
          {/*<ColorSettings/>*/}
        </div>
      )}
    </>
  );
}


