import React from "react";
import ReactGA from "react-ga4";
import { refreshConfig } from "@/components/settings/allSettings";
import LoadingScreen from "@/pages/LoadingScreen";

function SettingsLoading() {
  ReactGA.send({ hitType: "pageview", page: "/settings" });
  window.f1mvli.utils.changeWindowTitle("Settings — F1MV-Lights-Integration");

  let settingsLoaded = false;

  const loadSettings = async () => {
    await refreshConfig();
    settingsLoaded = true;
  };

  loadSettings().then(() => {window.location.hash = "/real-settings";});

  // we return the loading screen while we load the settings

  return (
    <LoadingScreen/>
  );
}

export default SettingsLoading;