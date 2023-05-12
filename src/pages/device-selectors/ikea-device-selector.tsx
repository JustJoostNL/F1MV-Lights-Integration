import IKEADeviceSelector from "@/components/device-selectors/ikea";
import ReactGA from "react-ga4";

export default function IkeaDeviceSelector(){
  ReactGA.send({ hitType: "pageview", page: "/manage-ikea-devices" });
  return (
    <div>
      <h1>IKEA Device Selector</h1>
      <IKEADeviceSelector/>
    </div>
  );
}