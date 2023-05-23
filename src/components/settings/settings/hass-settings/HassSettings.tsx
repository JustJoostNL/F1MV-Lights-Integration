import React, { useEffect, useState } from "react";
import { Box, TextField, Typography } from "@mui/material";
import { BlueSwitch, getConfig, settingBoxSX, handleSetSingleSetting } from "@/components/settings/allSettings";
import Divider from "@mui/material/Divider";
import HassMenu from "@/components/settings/settings/hass-settings/HassMenu";

export let saveConfig: () => Promise<void> = async () => {};

export default function HassSettingsContent() {
  const [settings, setSettings] = useState<any | null>(null);


  useEffect(() => {
    async function fetchConfig() {
      const config = await getConfig();
      setSettings(config.Settings.homeAssistantSettings);
    }
    fetchConfig();
  }, []);

  saveConfig = async () => {
    if (!settings) return;
    await window.f1mvli.config.set("Settings.homeAssistantSettings", {
      ...settings,
      devices: await window.f1mvli.config.get("Settings.homeAssistantSettings.devices")
    });
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
                                Disable Home Assistant Integration
              </Typography>
              <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                                This will disable the Home Assistant integration, enable this if you don't have Home Assistant devices.
              </Typography>
            </div>
            <BlueSwitch
              id="disable-hass-switch"
              checked={settings.homeAssistantDisable}
              onChange={(event) => {
                handleSetSingleSetting("homeAssistantDisable", event.target.checked, setSettings, settings);
              }}
            />
          </Box>
          <>
            {!settings.homeAssistantDisable && (
              <>
                <Divider sx={{ mb: "20px" }}/>
                <Box sx={settingBoxSX}>
                  <div>
                    <Typography variant="h6" component="div">
                      Home Assistant Server Host
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                      This is the hostname or IP of the system Home Assistant is running on. <b>Don't forget to add http:// or https://</b>
                    </Typography>
                  </div>
                  <TextField
                    color="secondary"
                    id="hass-server-ip-input"
                    label="Home Assistant Server Host"
                    variant="outlined"
                    value={settings.host}
                    onChange={(event) => {
                      handleSetSingleSetting("host", event.target.value, setSettings, settings);
                    }}
                  />
                </Box>
                <Box sx={settingBoxSX}>
                  <div>
                    <Typography variant="h6" component="div">
                      Home Assistant Server Port
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                      This is the port of the Home Assistant server. (default is 8123)
                    </Typography>
                  </div>
                  <TextField
                    color="secondary"
                    id="hass-server-port-input"
                    label="Home Assistant Server Port"
                    variant="outlined"
                    value={settings.port}
                    onChange={(event) => {
                      handleSetSingleSetting("port", event.target.value, setSettings, settings);
                    }}
                  />
                </Box>
                <Box sx={settingBoxSX}>
                  <div>
                    <Typography variant="h6" component="div">
                      Home Assistant Long-Lived Access Token
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                      This is the long-lived access token you can create in your Home Assistant profile.
                    </Typography>
                  </div>
                  <TextField
                    color="secondary"
                    id="hass-token-input"
                    label="Home Assistant Token"
                    variant="outlined"
                    value={settings.token}
                    onChange={(event) => {
                      handleSetSingleSetting("token", event.target.value, setSettings, settings);
                    }}
                  />
                </Box>
                <Box sx={settingBoxSX}>
                  <div>
                    <HassMenu/>
                  </div>
                </Box>
              </>
            )}
          </>
        </div>
      )}
    </>
  );
}