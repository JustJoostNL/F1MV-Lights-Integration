import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { BlueSwitch, settingBoxSX, handleSetSingleSetting, getConfig } from "@/components/settings/allSettings";
import NanoleafMenu from "@/components/settings/settings/nanoleaf-settings/NanoleafMenu";

export default function NanoleafSettingsContent() {
  const [settings, setSettings] = useState<any | null>(null);


  useEffect(() => {
    async function fetchConfig() {
      const config = await getConfig();
      setSettings(config.Settings.nanoLeafSettings);
    }
    fetchConfig();
  }, []);

  const saveConfig = async () => {
    if (!settings) return;
    await window.f1mvli.config.set("Settings.nanoLeafSettings", settings);
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
                Disable Nanoleaf Integration
              </Typography>
              <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                This will disable the Nanoleaf integration, enable this if you don't have Nanoleaf devices.
              </Typography>
            </div>
            <BlueSwitch
              id="disable-nanoleaf-switch"
              checked={settings.nanoLeafDisable}
              onChange={(event) => {
                handleSetSingleSetting("nanoLeafDisable", event.target.checked, setSettings, settings);
              }}
            />
          </Box>
          <>
            {!settings.nanoLeafDisable && (
              <Box sx={settingBoxSX}>
                <div>
                  <NanoleafMenu/>
                </div>
              </Box>
            )}
          </>
        </div>
      )}
    </>
  );
}