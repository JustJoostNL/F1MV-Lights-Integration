import "../style/App.scss";
import { createHashRouter, RouterProvider } from "react-router-dom";
import Main from "@/pages/Main";
import Home from "@/pages/Home";
import About from "@/pages/About";
import LogViewerPage from "@/pages/LogViewer";
import LoadingScreen from "@/pages/LoadingScreen";
import HassDeviceSelector from "@/pages/device-selectors/HassDeviceSelector";
import ManageWLEDDevices from "@/pages/device-selectors/ManageWLEDDevices";
import Settings from "@/pages/Settings";
import IkeaDeviceSelector from "@/pages/device-selectors/IKEADeviceSelector";
import EffectEditorPage from "@/pages/EffectEditorPage";
import UpdateScreen from "@/pages/Update";
import PhilipsHueSelector from "@/pages/device-selectors/PhilipsHueSelector";


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
    path: "/update",
    element: <UpdateScreen/>
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
    element: <PhilipsHueSelector type={"light"}/>
  },
  {
    path: "/manage-hue-entertainment-zones",
    element: <PhilipsHueSelector type={"zone"}/>
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
    path: "/manage-wled-devices",
    element: <ManageWLEDDevices/>
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
