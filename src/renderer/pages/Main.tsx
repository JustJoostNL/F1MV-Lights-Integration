import React from "react";
import log from "electron-log/renderer";
import ReactGA from "react-ga4";
import packageJson from "../../../package.json";
import "../style/index.css";
import { Loader } from "../components/shared/Loader";

export const updateInformation = {
  updateFound: false,
  userSkipsUpdate: false,
};

export const Main = () => {
  const initApp = async () => {
    if (process.env.VITE_DEV_SERVER_URL) {
      log.transports.console.level = "debug";
    } else {
      log.transports.console.level = false;
    }

    ReactGA.initialize("G-BMW3JWS0RJ", {
      //testMode: !!process.env.VITE_DEV_SERVER_URL,
      gaOptions: {
        appName: "F1MV-Lights-Integration",
        appId: "com.justjoostnl.f1mv.lights.integration",
        appInstallerId: "com.justjoostnl.f1mv.lights.integration",
        appVersion: packageJson.version,
        sampleRate: 100,
        siteSpeedSampleRate: 100,
      },
    });
    const updateInfo = await window.f1mvli.updater.getUpdateAvailable();
    if (updateInfo.updateAvailable) {
      updateInformation.updateFound = true;
      window.location.hash = "/update";
    }

    //await new Promise((resolve) => setTimeout(resolve, 2000));
  };

  initApp().then(() => {
    if (!updateInformation.updateFound || updateInformation.userSkipsUpdate) {
      window.location.hash = "/home";
    }
  });

  return <Loader />;
};
