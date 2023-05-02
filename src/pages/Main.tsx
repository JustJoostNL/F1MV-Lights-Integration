import LoadingScreen from "@/pages/LoadingScreen";
import log from "electron-log/renderer";

const Main = () => {

  const initApp = async () => {
    if (process.env.VITE_DEV_SERVER_URL) {
      log.transports.console.level = "debug";
    } else {
      log.transports.console.level = false;
    }
    //await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  initApp().then(() => {window.location.hash = "/home";});

  return (
    <LoadingScreen/>
  );
};

export default Main;