import ReactGA from "react-ga4";
import HueLightSelector from "@/components/device-selectors/hue/lights";
import HueEntertainmentZoneSelector from "@/components/device-selectors/hue/zones";
import { useEffect, useState } from "react";
import packageJson from "../../../package.json";

interface Props {
  type: "light" | "zone";
}

export default function PhilipsHueSelector({ type }: Props) {
  const [hueOnline, setHueOnline] = useState<boolean | null>(null);
  const pagePath = type === "light" ? "/manage-hue-lights" : "/manage-hue-entertainment-zones";
  ReactGA.initialize("G-BMW3JWS0RJ", {
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
    async function getHueOnline() {
      const states = await window.f1mvli.utils.getStates();
      const hueOnline = states.find((state: any) => state.name === "hue")?.state;
      setHueOnline(hueOnline);
    }
    getHueOnline();
  }, []);

  switch (hueOnline) {
    case true:
      ReactGA.send({ hitType: "pageview", page: pagePath });
      return (
        <div>
          <h1>{type === "light" ? "Philips Hue Light Selector" : "Philips Hue Zone Selector"}</h1>
          {type === "light" && <HueLightSelector />}
          {type === "zone" && <HueEntertainmentZoneSelector />}
        </div>
      );
    case false:
      return (
        <div>
          <h2>The app is not connected to a Philips Hue Bridge. Please check your Philips Hue configuration and try again.</h2>
        </div>
      );
    default:
      return (
        <div></div>
      );
  }
}