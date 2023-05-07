import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { BlueSwitch, getConfig, settingBoxSX, handleSetSingleSetting } from "@/components/settings/allSettings";

export default function DiscordSettingsContent() {
  const [settings, setSettings] = useState<any | null>(null);


  useEffect(() => {
    async function fetchConfig() {
      const config = await getConfig();
      setSettings(config.Settings.discordSettings);
    }
    fetchConfig();
  }, []);

  const saveConfig = async () => {
    if (!settings) return;
    await window.f1mvli.config.set("Settings.discordSettings", settings);
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
                                Disable Discord Rich Presence Integration
              </Typography>
              <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                                This will disable the Discord Rich Presence integration, enable this if you don't want to use Discord Rich Presence.
              </Typography>
            </div>
            <BlueSwitch
              id="disable-govee-switch"
              checked={settings.discordRPCDisable}
              onChange={(event) => {
                handleSetSingleSetting("discordRPCDisable", event.target.checked, setSettings, settings);
              }}
            />
          </Box>
          {!settings.discordRPCDisable && (
            <>
              <Box sx={settingBoxSX}>
                <div>
                  <Typography variant="h6" component="div">
                    Avoid spoilers in Discord Rich Presence
                  </Typography>
                  <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                    This will avoid showing spoilers (the current flag) in the Discord Rich Presence integration.
                  </Typography>
                </div>
                <BlueSwitch
                  id="discord-rpc-spoilers-switch"
                  checked={settings.avoidSpoilers}
                  onChange={(event) => {
                    handleSetSingleSetting("avoidSpoilers", event.target.checked, setSettings, settings);
                  }}
                />
              </Box>
            </>
          )}
        </div>
      )}
    </>
  );
}