import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/App";
import "./style/index.scss";
import { createTheme, ThemeProvider } from "@mui/material";
import { lightBlue } from "@mui/material/colors";
import * as Sentry from "@sentry/electron/renderer";
import packageJson from "../package.json";

Sentry.init({
  dsn: "https://e64c3ec745124566b849043192e58711@o4504289317879808.ingest.sentry.io/4504289338392576",
  //enabled: process.env.NODE_ENV === "production",
  release: "F1MV-Lights-Integration@" + packageJson.version,
  environment: process.env.VITE_DEV_SERVER_URL ? "development" : "production",
  tracesSampleRate: 0.2,
});

export const font = "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, sans-serif";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#212121",
    },
    secondary: {
      main: lightBlue[500],
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#2d2d2d",
        }
      }
    }
  }
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);

postMessage({ payload: "removeLoading" }, "*");
