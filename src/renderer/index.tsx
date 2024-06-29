import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, Grow, ThemeProvider } from "@mui/material";
import * as Sentry from "@sentry/electron/renderer";
import { SnackbarProvider } from "notistack";
import { HashRouter, Route, Routes } from "react-router-dom";
import packageJson from "../../package.json";
import { IndexPage } from "./pages/Main";
import { HomePage } from "./pages/Home";
import { theme } from "./lib/theme";
import { ConfigProvider } from "./hooks/useConfig";
import { MinimalScrollbars } from "./components/shared/MinimalScrollbars";
import { BaseStyle } from "./components/shared/BaseStyle";
import { SettingsPage } from "./pages/Settings";
import { EventEditorPage } from "./pages/EventEditor";
import { HomeAssistantDeviceSelector } from "./pages/HomeAssistantDeviceSelector";
import { HomebridgeAccessoriesSelector } from "./pages/HomebridgeAccessoriesSelector";
import { PhilipsHueDeviceSelector } from "./pages/PhilipsHueDeviceSelector";
import { PhilipsHueGroupSelector } from "./pages/PhilipsHueGroupSelector";
import { LogsPage } from "./pages/Logs";
import { WLEDDeviceSelector } from "./pages/WLEDDeviceSelector";
import { IkeaTradfriDeviceSelector } from "./pages/IkeaTradfriDeviceSelector";

Sentry.init({
  dsn: "https://e64c3ec745124566b849043192e58711@o4504289317879808.ingest.sentry.io/4504289338392576",
  //enabled: process.env.NODE_ENV === "production",
  release: "F1MV-Lights-Integration@" + packageJson.version,
  environment: process.env.VITE_DEV_SERVER_URL ? "development" : "production",
  tracePropagationTargets: ["localhost", "api.jstt.me", /(.*?)/],
  integrations: [
    Sentry.browserTracingIntegration({
      _experiments: {
        enableInteractions: true,
      },
    }),
    Sentry.replayIntegration({
      maskAllText: false,
      maskAllInputs: false,
      blockAllMedia: false,
      _experiments: {
        captureExceptions: true,
      },
    }),
  ],
  attachStacktrace: true,
  autoSessionTracking: true,
  enableTracing: true,
  replaysSessionSampleRate: 0.4,
  replaysOnErrorSampleRate: 1.0,
  profilesSampleRate: 1.0,
  tracesSampleRate: 1.0,
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <ConfigProvider>
      <SnackbarProvider
        autoHideDuration={1500}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        maxSnack={2}
        TransitionComponent={Grow}
      >
        <ThemeProvider theme={theme}>
          {window.f1mvli.platform !== "darwin" && <MinimalScrollbars />}
          <BaseStyle />
          <CssBaseline />
          <HashRouter>
            <Routes>
              <Route path="/" element={<IndexPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/event-editor" element={<EventEditorPage />} />
              <Route path="/logs" element={<LogsPage />} />
              <Route
                path="/home-assistant-ds"
                element={<HomeAssistantDeviceSelector />}
              />
              <Route
                path="/homebridge-as"
                element={<HomebridgeAccessoriesSelector />}
              />
              <Route
                path="/philips-hue-ds"
                element={<PhilipsHueDeviceSelector />}
              />
              <Route
                path="/philips-hue-gs"
                element={<PhilipsHueGroupSelector />}
              />
              <Route path="/wled-ds" element={<WLEDDeviceSelector />} />
              <Route
                path="/ikea-tradfri-ds"
                element={<IkeaTradfriDeviceSelector />}
              />
            </Routes>
          </HashRouter>
        </ThemeProvider>
      </SnackbarProvider>
    </ConfigProvider>
  </React.StrictMode>,
);
