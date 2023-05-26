import { HomeAssistantDeviceSelector } from "@/components/device-selectors/home-assistant";
import ReactGA from "react-ga4";
import { useEffect, useState } from "react";

export default function HassDeviceSelector(){
  const [hassOnline, setHassOnline] = useState<boolean | null>(null);
  ReactGA.send({ hitType: "pageview", page: "/manage-hass-devices" });

  useEffect(() => {
    async function getHassOnline(){
      const states = await window.f1mvli.utils.getStates();
      const hassOnline = states.find((state: any) => state.name === "homeAssistant")?.state;
      setHassOnline(hassOnline);
    }
    getHassOnline();
  }, []);

  switch (hassOnline) {
    case true:
      return (
        <div>
          <h1>Home Assistant Device Selector</h1>
          <HomeAssistantDeviceSelector/>
        </div>
      );
    case false:
      return (
        <div>
          <h2>The app is not connected to Home Assistant. Please check your Home Assistant configuration and try again.</h2>
        </div>
      );
    default:
      return (
        <div></div>
      );
  }
}