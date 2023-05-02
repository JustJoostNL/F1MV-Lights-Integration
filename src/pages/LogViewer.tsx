import React from "react";
import NavBar from "@/components/navbar";
import LogViewer from "@/components/log-viewer";

export default function LogViewerPage() {

  return (
    <div>
      <NavBar showSettingsBackButton={true} />
      <LogViewer />
    </div>
  );
}