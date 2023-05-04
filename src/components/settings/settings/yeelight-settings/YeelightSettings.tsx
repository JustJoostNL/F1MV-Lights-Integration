import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { BlueSwitch, settingBoxSX, handleSetSingleSetting, getConfig } from "@/components/settings/allSettings";
import YeelightMenu from "@/components/settings/settings/yeelight-settings/YeelightMenu";

export default function YeelightSettingsContent() {
  const [settings, setSettings] = useState<any | null>(null);


  useEffect(() => {
    async function fetchConfig() {
      const config = await getConfig();
      setSettings(config.Settings.yeeLightSettings);
    }
    fetchConfig();
  }, []);

  const saveConfig = async () => {
    if (!settings) return;
    await window.f1mvli.config.set("Settings.yeeLightSettings", settings);
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
                                Disable YeeLight Integration
              </Typography>
              <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                                This will disable the YeeLight integration, enable this if you don't have YeeLight devices.
              </Typography>
            </div>
            <BlueSwitch
              id="disable-wled-switch"
              checked={settings.yeeLightDisable}
              onChange={(event) => {
                handleSetSingleSetting("yeeLightDisable", event.target.checked, setSettings, settings);
              }}
            />
          </Box>
          <>
            {!settings.yeeLightDisable && (
              <Box sx={settingBoxSX}>
                <div>
                  <YeelightMenu/>
                </div>
              </Box>
            )}
          </>
        </div>
      )}
    </>
  );
}