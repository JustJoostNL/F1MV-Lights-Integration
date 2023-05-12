import React from "react";
import NavBar from "@/components/navbar";
import LogViewer from "@/components/log-viewer";
import ReactGA from "react-ga4";

export default function LogViewerPage() {
  ReactGA.send({ hitType: "pageview", page: "/log-viewer" });
  window.f1mvli.utils.changeWindowTitle("Logs — F1MV Lights Integration");

  return (
    <div>
      <NavBar showBackButton={true} />
      <LogViewer />
    </div>
  );
}