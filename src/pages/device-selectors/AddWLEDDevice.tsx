import WLEDDeviceAddFlow from "@/components/device-selectors/wled";
import ReactGA from "react-ga4";

export default function AddWLEDDevice(){
  ReactGA.send({ hitType: "pageview", page: "/add-wled-device" });
  return (
    <div>
      <h1>Manage WLED Devices</h1>
      <WLEDDeviceAddFlow/>
    </div>
  );
}