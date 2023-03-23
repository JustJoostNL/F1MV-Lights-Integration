import '../style/App.scss'
import {createHashRouter, RouterProvider} from "react-router-dom";
import Main from "@/pages/Main";
import Settings from "@/pages/Settings";
import Home from "@/pages/Home";

console.log('[App.tsx]', `Hello world from Electron ${process.versions.electron}!`)

const router = createHashRouter([
    {
        path: '/',
        element: <Main/>
    },
    {
        path: '/home',
        element: <Home/>
    },
    {
        path: '/settings',
        element: <Settings/>
    }
])

function App() {
  return (
      <RouterProvider router={router}/>
  )
}

export default App
