import LoadingScreen from "@/pages/LoadingScreen";
import log from "electron-log/renderer";
import ReactGA from "react-ga4";
import packageJson from "../../package.json";

const Main = () => {
  let updateFound = false;

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
      }
    });

    //await window.f1mvli.updater.checkForUpdates();
    const updateInfo = await window.f1mvli.updater.getUpdateAvailable();
    if (updateInfo.updateAvailable) {
      updateFound = true;
      window.location.hash = "/update";
    }

    //await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  initApp().then(() => {
    if (!updateFound) window.location.hash = "/home";
  });

  return (
    <LoadingScreen />
  );
};

export default Main;