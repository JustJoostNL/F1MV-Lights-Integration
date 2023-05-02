import React, { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Alert, Box, TextField, Typography } from "@mui/material";
import { BlueSwitch, settingBoxSX } from "@/components/settings/allSettings";
import Divider from "@mui/material/Divider";
import Toaster from "@/components/toaster/Toaster";
import IkeaMenu from "@/components/settings/settings/ikea-settings/IkeaMenu";

export default function IkeaSettingsContent() {
  const [settings, setSettings] = useState<any | null>(null);
  const [ikeaAdvancedSettings, setIkeaAdvancedSettings] = useState(false);

  useHotkeys("shift+a+2", () => {
    setIkeaAdvancedSettings(!ikeaAdvancedSettings);
  });


  useEffect(() => {
    async function fetchConfig() {
      const config = await window.f1mvli.config.getAll();
      setSettings(config.Settings.ikeaSettings);
    }
    fetchConfig();
  }, []);

  const handleSetSingleSetting = (setting: string, value: any) => {
    setSettings({
      ...settings,
      [setting]: value,
    });
  };

  const saveConfig = async () => {
    if (!settings) return;
    await window.f1mvli.config.set("Settings.ikeaSettings", settings);
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
                                Disable Ikea Integration
              </Typography>
              <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                                This will disable the Ikea integration, enable this if you don't have Ikea devices.
              </Typography>
            </div>
            <BlueSwitch
              id="disable-ikea-switch"
              checked={settings.ikeaDisable}
              onChange={(event) => {
                handleSetSingleSetting("ikeaDisable", event.target.checked);
              }}
            />
          </Box>
          <>
            {!settings.ikeaDisable && (
              <>
                <Divider sx={{ mb: "20px" }}/>
                <Box sx={settingBoxSX}>
                  <div>
                    <Typography variant="h6" component="div">
                                            Ikea gateway security code
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                                            The security code of your Ikea gateway, you can find this at the back of your gateway.
                    </Typography>
                  </div>
                  <TextField
                    color="secondary"
                    id="ikea-security-code-input"
                    label="Security code"
                    variant="outlined"
                    value={settings.securityCode}
                    onChange={(event) => {
                      handleSetSingleSetting("securityCode", event.target.value);
                    }}
                  />
                </Box>
              </>
            )}
          </>
          <>
            {!settings.ikeaDisable && ikeaAdvancedSettings && (
              <>
                <>
                  <Toaster message={"Ikea advanced settings are now visible!"} severity={"info"} time={3000}/>
                </>
                <Alert sx={{ mb: "20px", mr: "650px" }} severity="warning">Please do not change these settings unless you know what you're doing!!</Alert>
                <Divider sx={{ mb: "20px" }}/>
                <Box sx={settingBoxSX}>
                  <div>
                    <Typography variant="h6" component="div">
                                            Ikea Identity
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                                            This is the identity the app uses to pair with the gateway, this is/will be generated automatically.
                    </Typography>
                  </div>
                  <TextField
                    color="secondary"
                    id="ikea-identity-code-input"
                    label="Identity"
                    variant="outlined"
                    value={settings.identity}
                    onChange={(event) => {
                      handleSetSingleSetting("identity", event.target.value);
                    }}
                  />
                </Box>
                <Box sx={settingBoxSX}>
                  <div>
                    <Typography variant="h6" component="div">
                                            Ikea Pre-shared key
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                                            This is the pre-shared key the app uses to pair with the gateway, this is/will be generated automatically.
                    </Typography>
                  </div>
                  <TextField
                    color="secondary"
                    id="ikea-psk-code-input"
                    label="Pre-shared key"
                    variant="outlined"
                    value={settings.psk}
                    onChange={(event) => {
                      handleSetSingleSetting("psk", event.target.value);
                    }}
                  />
                </Box>
                <Divider sx={{ mb: "20px" }}/>
              </>
            )}
          </>
          <>
            {!settings.ikeaDisable && (
              <Box sx={settingBoxSX}>
                <div>
                  <IkeaMenu/>
                </div>
              </Box>
            )}
          </>
        </div>
      )}
    </>
  );
}