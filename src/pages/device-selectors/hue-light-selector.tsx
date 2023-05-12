import HueLightSelector from "@/components/device-selectors/hue/lights";
import ReactGA from "react-ga4";

export default function PhilipsHueLightSelector(){
  ReactGA.send({ hitType: "pageview", page: "/manage-hue-lights" });
  return (
    <div>
      <h1>Philips Hue Light Selector</h1>
      <HueLightSelector/>
    </div>
  );
}