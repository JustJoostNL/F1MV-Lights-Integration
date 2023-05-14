import "../style/App.scss";
import { createHashRouter, RouterProvider } from "react-router-dom";
import Main from "@/pages/Main";
import Home from "@/pages/Home";
import About from "@/pages/About";
import LogViewerPage from "@/pages/LogViewer";
import LoadingScreen from "@/pages/LoadingScreen";
import HassDeviceSelector from "@/pages/device-selectors/hass-device-selector";
import AddWLEDDevice from "@/pages/device-selectors/add-wled-device";
import Settings from "@/pages/Settings";
import IkeaDeviceSelector from "@/pages/device-selectors/ikea-device-selector";
import PhilipsHueLightSelector from "@/pages/device-selectors/hue-light-selector";
import PhilipsHueZoneSelector from "@/pages/device-selectors/hue-entertainment-zone-selector";
import EffectEditorPage from "@/pages/EffectEditorPage";


const router = createHashRouter([
  {
    path: "/",
    element: <Main/>
  },
  {
    path: "/home",
    element: <Home/>
  },
  {
    path: "/about",
    element: <About/>
  },
  {
    path: "/settings",
    element: <Settings/>
  },
  {
    path: "/log-viewer",
    element: <LogViewerPage/>
  },
  {
    path: "/loading-screen",
    element: <LoadingScreen/>
  },
  {
    path: "/manage-hue-lights",
    element: <PhilipsHueLightSelector/>
  },
  {
    path: "/manage-hue-entertainment-zones",
    element: <PhilipsHueZoneSelector/>
  },
  {
    path: "/manage-hass-devices",
    element: <HassDeviceSelector/>
  },
  {
    path: "/manage-ikea-devices",
    element: <IkeaDeviceSelector/>
  },
  {
    path: "/add-wled-device",
    element: <AddWLEDDevice/>
  },
  {
    path: "/effect-editor",
    element: <EffectEditorPage/>
  }
]);

function App() {
  return (
    <RouterProvider router={router}/>
  );
}

export default App;
