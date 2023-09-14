import React, { useEffect, useState } from "react";
import { BlueSwitch, getConfig, settingBoxSX, handleSetSingleSetting } from "@/components/settings/allSettings";
import { Box, Checkbox, Divider, FormControlLabel, FormGroup, TextField, Typography } from "@mui/material";
import { BlueSlider } from "@/components/settings/BlueSlider";
import { HandleFlagChange } from "@/components/settings/settings/general-settings/HandleFlagChange";
import ColorSettings from "@/components/settings/settings/general-settings/ColorSettings";
import Button from "@mui/material/Button";


export default function GeneralSettingsContent() {
  const [settings, setSettings] = useState<any | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      const config = await getConfig();
      setSettings(config.Settings.generalSettings);
    }
    fetchConfig();
  }, []);

  const saveConfig = async () => {
    if (!settings) return;
    await window.f1mvli.config.set("Settings.generalSettings", {
      ...settings,
      effectSettings: await window.f1mvli.config.get("Settings.generalSettings.effectSettings"),
      colorSettings: settings.colorSettings ?? await window.f1mvli.config.get("Settings.generalSettings.colorSettings"),
    });
  };

  useEffect(() => {
    saveConfig();
  }, [settings]);

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
                handleSetSingleSetting("autoTurnOffLights", event.target.checked, setSettings, settings);
              }}
            />
          </Box>
          <Box sx={settingBoxSX}>
            <div>
              <Typography variant="h6" component="div">
                Start MultiViewer automatically when F1MV Lights Integration starts
              </Typography>
              <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                This will automatically start MultiViewer when F1MV Lights Integration starts.
              </Typography>
            </div>
            <BlueSwitch
              id="auto-start-multiviewer-switch"
              checked={settings.startMultiViewerWhenAppStarts}
              onChange={(event) => {
                handleSetSingleSetting("startMultiViewerWhenAppStarts", event.target.checked, setSettings, settings);
              }}
            />
          </Box>
          <Divider sx={{ mb: "20px" }}/>
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
                handleSetSingleSetting("defaultBrightness", value, setSettings, settings);
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
                handleSetSingleSetting("goBackToStatic", event.target.checked, setSettings, settings);
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
                    handleSetSingleSetting("goBackToStaticDelay", event.target.value, setSettings, settings);
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
                    handleSetSingleSetting("staticBrightness", value, setSettings, settings);
                  }}
                />
              </Box>
              <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                color: "white",
                textAlign: "left",
                marginBottom: "20px",
                marginRight: "500px"
              }}>
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
                        onChange={(event) => HandleFlagChange("green", event.target.checked, setSettings, settings)}
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
                        onChange={(event) => HandleFlagChange("yellow", event.target.checked, setSettings, settings)}
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
                        onChange={(event) => HandleFlagChange("red", event.target.checked, setSettings, settings)}
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
                        onChange={(event) => HandleFlagChange("safetyCar", event.target.checked, setSettings, settings)}
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
                        onChange={(event) => HandleFlagChange("vsc", event.target.checked, setSettings, settings)}
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
                        onChange={(event) => HandleFlagChange("vscEnding", event.target.checked, setSettings, settings)}
                      />
                    }
                    label={"VSC Ending"}
                  />
                </FormGroup>
              </Box>
            </>)}
          <Divider sx={{ mb: "20px" }}/>
          <ColorSettings settings={settings} setSettings={setSettings}/>
          <Divider sx={{ mb: "20px" }}/>
          <Box sx={settingBoxSX}>
            <div>
              <Typography variant="h6" component="div">
                Effect Settings
              </Typography>
              <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                Here you can customize your experience by creating your own effects, using an advanced effect editor.
              </Typography>
              <Button
                sx={{ marginTop: "15px" }}
                variant="contained"
                color="secondary"
                onClick={() => {
                  window.location.hash = "#/effect-editor";
                }}
              >
                Open Effect Editor
              </Button>
            </div>
          </Box>
        </div>
      )}
    </>
  );
}


