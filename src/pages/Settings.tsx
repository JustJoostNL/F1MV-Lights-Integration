import React from "react";
import NavBar from "@/components/navbar";
import SettingsPage from "@/components/settings";
import ReactGA from "react-ga4";

function Settings() {
  ReactGA.send({ hitType: "pageview", page: "/settings" });
  window.f1mvli.utils.changeWindowTitle("Settings — F1MV-Lights-Integration");

  return (
    <div>
      <NavBar showBackButton={true} />
      <SettingsPage />
    </div>
  );
}

export default Settings;