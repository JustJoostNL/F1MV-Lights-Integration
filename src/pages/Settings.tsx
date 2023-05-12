import React, { useState, useEffect } from "react";
import ReactGA from "react-ga4";
import { refreshConfig } from "@/components/settings/allSettings";
import LoadingScreen from "@/pages/LoadingScreen";
import NavBar from "@/components/navbar";
import SettingsPage from "@/components/settings";

function Settings() {
  ReactGA.send({ hitType: "pageview", page: "/settings" });
  window.f1mvli.utils.changeWindowTitle("Settings — F1MV Lights Integration");

  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

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
      </div>
    );
  }

  // if neither condition is true we return null
  return null;
}

export default Settings;