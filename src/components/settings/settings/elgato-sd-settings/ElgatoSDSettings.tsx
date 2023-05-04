import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { BlueSwitch, getConfig, settingBoxSX, handleSetSingleSetting } from "@/components/settings/allSettings";

export default function ElgatoSDSettingsContent() {
  const [settings, setSettings] = useState<any | null>(null);


  useEffect(() => {
    async function fetchConfig() {
      const config = await getConfig();
      setSettings(config.Settings.streamDeckSettings);
    }
    fetchConfig();
  }, []);

  const saveConfig = async () => {
    if (!settings) return;
    await window.f1mvli.config.set("Settings.streamDeckSettings", settings);
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
                                Disable Elgato Stream Deck Integration
              </Typography>
              <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                                This will disable the Elgato Stream Deck integration, enable this if you don't have an Elgato Stream Deck.
              </Typography>
            </div>
            <BlueSwitch
              id="disable-govee-switch"
              checked={settings.streamDeckDisable}
              onChange={(event) => {
                handleSetSingleSetting("streamDeckDisable", event.target.checked, setSettings, settings);
              }}
            />
          </Box>
        </div>
      )}
    </>
  );
}