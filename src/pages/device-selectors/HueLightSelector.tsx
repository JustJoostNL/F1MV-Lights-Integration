import HueLightSelector from "@/components/device-selectors/hue/lights";
import ReactGA from "react-ga4";
import {useEffect, useState} from "react";

export default function PhilipsHueLightSelector(){
  const [hueOnline, setHueOnline] = useState<boolean | null>(null);
  ReactGA.send({ hitType: "pageview", page: "/manage-hue-lights" });

  useEffect(() => {
    async function getHueOnline(){
      const states = await window.f1mvli.utils.getStates();
      const hueOnline = states.find((state: any) => state.name === "hue")?.state;
      setHueOnline(hueOnline);
    }
    getHueOnline();
  }, []);

  switch (hueOnline) {
    case true:
      return (
        <div>
          <h1>Philips Hue Light Selector</h1>
          <HueLightSelector/>
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