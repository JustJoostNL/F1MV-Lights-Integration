import ReactGA from "react-ga4";
import HueEntertainmentZoneSelector from "@/components/device-selectors/hue/zones";

export default function PhilipsHueZoneSelector(){
  ReactGA.send({ hitType: "pageview", page: "/manage-hue-entertainment-zones" });
  return (
    <div>
      <h1>Philips Hue Zone Selector</h1>
      <HueEntertainmentZoneSelector />
    </div>
  );
}