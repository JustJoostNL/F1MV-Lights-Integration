import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { BlueSwitch, getConfig, settingBoxSX, handleSetSingleSetting } from "@/components/settings/allSettings";

export default function GoveeSettingsContent() {
  const [settings, setSettings] = useState<any | null>(null);


  useEffect(() => {
    async function fetchConfig() {
      const config = await getConfig();
      setSettings(config.Settings.goveeSettings);
    }
    fetchConfig();
  }, []);

  const saveConfig = async () => {
    if (!settings) return;
    await window.f1mvli.config.set("Settings.goveeSettings", settings);
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
                                Disable Govee Integration
              </Typography>
              <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                                This will disable the Govee integration, enable this if you don't have Govee devices.
              </Typography>
            </div>
            <BlueSwitch
              id="disable-govee-switch"
              checked={settings.goveeDisable}
              onChange={(event) => {
                handleSetSingleSetting("goveeDisable", event.target.checked, setSettings, settings);
              }}
            />
          </Box>
        </div>
      )}
    </>
  );
}