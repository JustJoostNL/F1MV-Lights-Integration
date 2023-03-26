import React, {useEffect, useState} from "react";
import {BlueSwitch, settingBoxSX} from "@/components/settings/allSettings";
import {Alert, Box, TextField, Typography} from "@mui/material";
import HueMenu from "@/components/settings/settings/hue-settings/HueMenu";
import { useHotkeys } from 'react-hotkeys-hook'
import Toaster from "@/components/toaster/Toaster";
import Divider from "@mui/material/Divider";

export default function HueSettingsContent() {
    const [settings, setSettings] = useState<any | null>(null);
    const [hueAdvancedSettings, setHueAdvancedSettings] = useState(false);

    // for the user to show the custom IP setting, he just needs to do a little secret trick, just needs to do ctrl+shift+h

    useHotkeys('ctrl+shift+h', () => {
        console.log('active')
        setHueAdvancedSettings(!hueAdvancedSettings)
    })


    useEffect(() => {
        async function fetchConfig() {
            const config = await window.f1mvli.config.getAll();
            setSettings(config.Settings.hueSettings);
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
        await window.f1mvli.config.set("Settings.hueSettings", settings);
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
                                Disable Philips Hue Integration
                            </Typography>
                            <Typography variant="body2" component="div" sx={{color: "grey"}}>
                                This will disable the Philips Hue integration, disable this if you don't have Philips Hue devices.
                            </Typography>
                        </div>
                        <BlueSwitch
                            id="auto-turn-off-lights-switch"
                            checked={settings.hueDisable}
                            onChange={(event) => {
                                handleSetSingleSetting("hueDisable", event.target.checked);
                            }}
                        />
                    </Box>
                    <Divider sx={{mb: "20px"}}/>
                    <>
                        {hueAdvancedSettings && !settings.hueDisable && (
                    <>
                    <>
                        <Toaster message={"Hue advanced settings are now visible!"} severity={"info"} time={3000}/>
                    </>
                    <Box sx={settingBoxSX}>
                        <div>
                            <Typography variant="h6" component="div">
                                Hue bridge IP
                            </Typography>
                            <Typography variant="body2" component="div" sx={{color: "grey"}}>
                                If you know your Hue bridge IP, you can enter it here. If you don't know it, leave this blank, and it will be automatically detected.
                            </Typography>
                        </div>
                        <TextField
                            color="secondary"
                            id="hue-bridge-ip"
                            label="Hue bridge IP"
                            variant="outlined"
                            value={settings.hueBridgeIP}
                            onChange={(event) => {
                                handleSetSingleSetting("hueBridgeIP", event.target.value);
                            }}
                        />
                    </Box>
                    <Box sx={settingBoxSX}>
                        <div>
                            <Typography variant="h6" component="div">
                                Hue bridge token
                            </Typography>
                            <Typography variant="body2" component="div" sx={{color: "grey"}}>
                                If you know your Hue bridge token, you can enter it here. If you don't know it, leave this blank, and it will be automatically generated.
                            </Typography>
                        </div>
                        <TextField
                            color="secondary"
                            id="hue-bridge-token"
                            label="Hue bridge token"
                            variant="outlined"
                            value={settings.token}
                            onChange={(event) => {
                                handleSetSingleSetting("token", event.target.value);
                            }}
                        />
                    </Box>
                    </>)}</>
                    <Box sx={settingBoxSX}>
                        <div>
                            <HueMenu/>
                        </div>
                    </Box>
                </div>
            )}
        </>
    );
}