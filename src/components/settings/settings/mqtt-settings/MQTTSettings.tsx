import React, { useEffect, useState } from "react";
import { BlueSwitch, settingBoxSX, getConfig, handleSetSingleSetting } from "@/components/settings/allSettings";
import { Box, Divider, TextField, Typography } from "@mui/material";
import OpenRGBMenu from "@/components/settings/settings/openrgb-settings/OpenRGBMenu";
import MQTTMenu from "@/components/settings/settings/mqtt-settings/MQTTMenu";

export let saveConfig: () => Promise<void> = async () => {};

export default function MQTTSettingsContent() {
  const [settings, setSettings] = useState<any | null>(null);


  useEffect(() => {
    async function fetchConfig() {
      const config = await getConfig();
      setSettings(config.Settings.MQTTSettings);
    }

    fetchConfig();
  }, []);

  saveConfig = async () => {
    if (!settings) return;
    await window.f1mvli.config.set("Settings.MQTTSettings", {
      ...settings,
      username: settings.username === "" ? undefined : settings.username,
      password: settings.password === "" ? undefined : settings.password,
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
                Disable MQTT Integration
              </Typography>
              <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                This will disable the MQTT integration, enable this if you don't want to use MQTT.
              </Typography>
            </div>
            <BlueSwitch
              id="disable-mqtt-switch"
              checked={settings.MQTTDisable}
              onChange={(event) => {
                handleSetSingleSetting("MQTTDisable", event.target.checked, setSettings, settings);
              }}
            />
          </Box>
          <>
            {!settings.MQTTDisable && (
              <>
                <Divider sx={{ mb: "20px" }}/>
                <Box sx={settingBoxSX}>
                  <div>
                    <Typography variant="h6" component="div">
                      MQTT Broker Host
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                      This is the hostname or IP the MQTT broker is running on. <b>You don't have to add mqtt://</b>
                    </Typography>
                  </div>
                  <TextField
                    color="secondary"
                    id="mqtt-broker-host-input"
                    label="MQTT Broker Host"
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
                      MQTT Broker Port
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                      This is the port the MQTT broker is running on. (default is 1883)
                    </Typography>
                  </div>
                  <TextField
                    color="secondary"
                    id="mqtt-broker-port-input"
                    label="MQTT Broker Port"
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
                      Username (Optional)
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                      If your MQTT broker requires a username, you can add it here.
                    </Typography>
                  </div>
                  <TextField
                    color="secondary"
                    id="mqtt-broker-username-input"
                    label="MQTT Broker Username"
                    variant="outlined"
                    value={settings.username}
                    onChange={(event) => {
                      handleSetSingleSetting("username", event.target.value, setSettings, settings);
                    }}
                  />
                </Box>
                <Box sx={settingBoxSX}>
                  <div>
                    <Typography variant="h6" component="div">
                      Password (Optional)
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                      If your MQTT broker requires a password, you can add it here.
                    </Typography>
                  </div>
                  <TextField
                    color="secondary"
                    id="mqtt-broker-password-input"
                    label="MQTT Broker Password"
                    variant="outlined"
                    value={settings.password}
                    onChange={(event) => {
                      handleSetSingleSetting("password", event.target.value, setSettings, settings);
                    }}
                  />
                </Box>
                <>
                  {!settings.MQTTDisable && (
                    <Box sx={settingBoxSX}>
                      <div>
                        <MQTTMenu/>
                      </div>
                    </Box>
                  )}
                </>
              </>
            )}
          </>
        </div>
      )}
    </>
  );
}
