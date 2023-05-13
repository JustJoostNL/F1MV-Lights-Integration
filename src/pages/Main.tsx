import LoadingScreen from "@/pages/LoadingScreen";
import log from "electron-log/renderer";
import ReactGA from "react-ga4";
import packageJson from "../../package.json";

const Main = () => {

  const initApp = async () => {
    if (process.env.VITE_DEV_SERVER_URL) {
      log.transports.console.level = "debug";
    } else {
      log.transports.console.level = false;
    }

    const analyticsPref = await window.f1mvli.config.get("Settings.advancedSettings.analytics");

    if (analyticsPref) {
      ReactGA.initialize("G-BMW3JWS0RJ", {
        //testMode: !!process.env.VITE_DEV_SERVER_URL,
        gaOptions: {
          appName: "F1MV-Lights-Integration",
          appId: "com.justjoostnl.f1mv.lights.integration",
          appInstallerId: "com.justjoostnl.f1mv.lights.integration",
          appVersion: packageJson.version,
          sampleRate: 100,
          siteSpeedSampleRate: 100,
          // will be custom soon:
          gtagUrl: "https://www.googletagmanager.com/gtag/js",
        }
      });
    }

    //await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  initApp().then(() => {window.location.hash = "/home";});

  return (
    <LoadingScreen/>
  );
};

export default Main;