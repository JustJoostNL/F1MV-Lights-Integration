import { HomeAssistantDeviceSelector } from "@/components/device-selectors/home-assistant";
import ReactGA from "react-ga4";

export default function HassDeviceSelector(){
  ReactGA.send({ hitType: "pageview", page: "/manage-hass-devices" });
  return (
    <div>
      <h1>Home Assistant Device Selector</h1>
      <HomeAssistantDeviceSelector/>
    </div>
  );
}