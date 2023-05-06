import "../style/App.scss";
import { createHashRouter, RouterProvider } from "react-router-dom";
import Main from "@/pages/Main";
import SettingsLoading from "@/pages/Settings";
import Home from "@/pages/Home";
import About from "@/pages/About";
import LogViewerPage from "@/pages/LogViewer";
import LoadingScreen from "@/pages/LoadingScreen";
import Settings from "@/pages/RealSettings";
import HassDeviceSelector from "@/pages/device-selectors/hass-device-selector";

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
    element: <SettingsLoading/>
  },
  {
    path: "/real-settings",
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
  }
]);

function App() {
  return (
    <RouterProvider router={router}/>
  );
}

export default App;
