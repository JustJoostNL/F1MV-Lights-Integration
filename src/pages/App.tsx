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
    path: "/select-hass-devices",
    element: <HassDeviceSelector/>
  },
  {
    path: "/select-ikea-devices",
    element: <IkeaDeviceSelector/>
  },
  {
    path: "/add-wled-device",
    element: <AddWLEDDevice/>
  }
]);

function App() {
  return (
    <RouterProvider router={router}/>
  );
}

export default App;
