import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { BlueSwitch, settingBoxSX, handleSetSingleSetting, getConfig } from "@/components/settings/allSettings";
import WLEDMenu from "@/components/settings/settings/wled-settings/WLEDMenu";

export default function WLEDSettingsContent() {
  const [settings, setSettings] = useState<any | null>(null);


  useEffect(() => {
    async function fetchConfig() {
      const config = await getConfig();
      setSettings(config.Settings.WLEDSettings);
    }
    fetchConfig();
  }, []);

  const saveConfig = async () => {
    if (!settings) return;
    await window.f1mvli.config.set("Settings.WLEDSettings", settings);
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
                                Disable WLED Integration
              </Typography>
              <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                                This will disable the WLED integration, enable this if you don't have WLED devices.
              </Typography>
            </div>
            <BlueSwitch
              id="disable-wled-switch"
              checked={settings.WLEDDisable}
              onChange={(event) => {
                handleSetSingleSetting("WLEDDisable", event.target.checked, setSettings, settings);
              }}
            />
          </Box>
          <>
            {!settings.WLEDDisable && (
              <Box sx={settingBoxSX}>
                <div>
                  <WLEDMenu/>
                </div>
              </Box>
            )}
          </>
        </div>
      )}
    </>
  );
}