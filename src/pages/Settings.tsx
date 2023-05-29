import React, { useState, useEffect } from "react";
import ReactGA from "react-ga4";
import { refreshConfig } from "@/components/settings/allSettings";
import LoadingScreen from "@/pages/LoadingScreen";
import NavBar from "@/components/navbar";
import SettingsPage from "@/components/settings";
import { Button, Typography } from "@mui/material";

function Settings() {
  ReactGA.send({ hitType: "pageview", page: "/settings" });
  window.f1mvli.utils.changeWindowTitle("Settings — F1MV Lights Integration");

  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const handleResetConfigToDefault = async () => {
    const resetRes = await window.f1mvli.config.resetToDefault();
    if (resetRes) window.location.reload();
  };

  useEffect(() => {
    const loadSettings = async () => {
      await refreshConfig();
      setSettingsLoading(false);
      setSettingsLoaded(true);
    };
    loadSettings();
  }, []);

  if (settingsLoading) {
    return <LoadingScreen />;
  } else if (settingsLoaded) {
    return (
      <div>
        <NavBar showBackButton={true} />
        <SettingsPage />
        <Button color={"secondary"} variant={"contained"} onClick={handleResetConfigToDefault}>Reset settings to default</Button>
        <Typography sx={{ mt: 2, color: "grey" }} variant={"body2"}>
          Please try to reset your settings to the defaults if you are experiencing any issues with the app.
        </Typography>
      </div>
    );
  }

  // if neither condition is true we return null
  return null;
}

export default Settings;