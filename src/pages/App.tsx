import "../style/App.scss";
import { createHashRouter, RouterProvider } from "react-router-dom";
import Main from "@/pages/Main";
import Settings from "@/pages/Settings";
import Home from "@/pages/Home";
import About from "@/pages/about";
import LogViewerPage from "@/pages/LogViewer";

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
  }
]);

function App() {
  return (
    <RouterProvider router={router}/>
  );
}

export default App;
