import IKEADeviceSelector from "@/components/device-selectors/ikea";
import ReactGA from "react-ga4";
import { useEffect, useState } from "react";
import packageJson from "../../../package.json";

export default function IkeaDeviceSelector(){
  const [ikeaOnline, setIkeaOnline] = useState<boolean | null>(null);
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
    async function getIkeaOnline() {
      const states = await window.f1mvli.utils.getStates();
      const ikeaOnline = states.find((state: any) => state.name === "ikea")?.state;
      setIkeaOnline(ikeaOnline);
    }

    getIkeaOnline();
  }, []);

  switch (ikeaOnline) {
    case true:
      ReactGA.send({ hitType: "pageview", page: "/manage-ikea-devices" });
      return (
        <div>
          <h1>IKEA Device Selector</h1>
          <IKEADeviceSelector/>
        </div>
      );
    case false:
      return (
        <div>
          <h2>The app is not connected to an IKEA Gateway. Please check your IKEA configuration and try again.</h2>
        </div>
      );
    default:
      return (
        <div></div>
      );
  }
}