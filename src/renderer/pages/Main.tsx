import React from "react";
import log from "electron-log/renderer";
import { Loader } from "../components/shared/Loader";

const updateInformation = {
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

    const updateAvailable = await window.f1mvli.updater.getUpdateAvailable();
    if (updateAvailable) {
      updateInformation.updateFound = true;
      window.location.hash = "/update";
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  };

  initApp().then(() => {
    if (!updateInformation.updateFound || updateInformation.userSkipsUpdate) {
      window.location.hash = "/home";
    }
  });

  return <Loader />;
};
