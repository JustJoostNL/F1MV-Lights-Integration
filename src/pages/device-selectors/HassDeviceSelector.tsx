import { HomeAssistantDeviceSelector } from "@/components/device-selectors/home-assistant";
import ReactGA from "react-ga4";
import { useEffect, useState } from "react";
import packageJson from "../../../package.json";

export default function HassDeviceSelector() {
  const [hassOnline, setHassOnline] = useState<boolean | null>(null);
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

  useEffect(() => {
    async function getHassOnline() {
      const states = await window.f1mvli.utils.getStates();
      const hassOnline = states.find((state: any) => state.name === "homeAssistant")?.state;
      setHassOnline(hassOnline);
    }

    getHassOnline();
  }, []);

  switch (hassOnline) {
    case true:
      ReactGA.send({ hitType: "pageview", page: "/manage-hass-devices" });
      return (
        <div>
          <h1>Home Assistant Device Selector</h1>
          <HomeAssistantDeviceSelector/>
        </div>
      );
    case false:
      return (
        <div>
          <h2>The app is not connected to Home Assistant. Please check your Home Assistant configuration and try
            again.</h2>
        </div>
      );
    default:
      return (
        <div></div>
      );
  }
}