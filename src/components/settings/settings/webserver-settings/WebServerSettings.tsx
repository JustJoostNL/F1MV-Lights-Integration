import React, { useEffect, useState } from "react";
import { Box, TextField, Typography } from "@mui/material";
import { BlueSwitch, settingBoxSX } from "@/components/settings/allSettings";

export default function WebServerSettingsContent() {
  const [settings, setSettings] = useState<any | null>(null);


  useEffect(() => {
    async function fetchConfig() {
      const config = await window.f1mvli.config.getAll();
      setSettings(config.Settings.webServerSettings);
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
    await window.f1mvli.config.set("Settings.webServerSettings", settings);
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
                                Disable Webserver
              </Typography>
              <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                                This will disable the webserver, enable this if you don't want a webserver to run.
              </Typography>
            </div>
            <BlueSwitch
              id="disable-govee-switch"
              checked={settings.webServerDisable}
              onChange={(event) => {
                handleSetSingleSetting("webServerDisable", event.target.checked);
              }}
            />
          </Box>
          <>
            {!settings.webServerDisable && (
              <Box sx={settingBoxSX}>
                <div>
                  <Typography variant="h6" component="div">
                                        Webserver Port
                  </Typography>
                  <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                                        This is the port the webserver will run on.
                  </Typography>
                </div>
                <TextField
                  color="secondary"
                  id="webserver-port"
                  label="Webserver Port"
                  variant="outlined"
                  value={settings.webServerPort}
                  onChange={(event) => {
                    handleSetSingleSetting("webServerPort", event.target.value);
                  }}
                />
              </Box>
            )}
          </>
        </div>
      )}
    </>
  );
}