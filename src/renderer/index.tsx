import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import * as Sentry from "@sentry/electron/renderer";
import { SnackbarProvider } from "notistack";
import { createHashRouter, RouterProvider } from "react-router-dom";
import packageJson from "../../package.json";
import { Main } from "./pages/Main";
import { HomePage } from "./pages/Home";
import { theme } from "./lib/theme";
import { ConfigProvider } from "./hooks/useConfig";
import "./style/app.css";

Sentry.init({
  dsn: "https://e64c3ec745124566b849043192e58711@o4504289317879808.ingest.sentry.io/4504289338392576",
  //enabled: process.env.NODE_ENV === "production",
  release: "F1MV-Lights-Integration@" + packageJson.version,
  environment: process.env.VITE_DEV_SERVER_URL ? "development" : "production",
  integrations: [
    new Sentry.BrowserTracing({
      traceFetch: true,
      tracePropagationTargets: ["localhost", "api.jstt.me"],
    }),
    new Sentry.Replay({
      maskAllText: false,
      maskAllInputs: false,
      blockAllMedia: false,
    })
  ],
  replaysSessionSampleRate: 0.2,
  replaysOnErrorSampleRate: 1.0,
  tracesSampleRate: 1.0,
});

export const font = "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, sans-serif";

const router = createHashRouter([
  {
    path: "/",
    element: <Main/>
  },
  {
    path: "/home",
    element: <HomePage/>
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider>
      <SnackbarProvider
        autoHideDuration={3000}
      >
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <RouterProvider router={router}/>
        </ThemeProvider>
      </SnackbarProvider>
    </ConfigProvider>
  </React.StrictMode>,
);
