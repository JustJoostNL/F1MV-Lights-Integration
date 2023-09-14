import { Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { ipcRenderer, shell } from "electron";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import LoadingScreen from "@/pages/LoadingScreen";
import { updateVars } from "@/pages/Main";
import { useHotkeys } from "react-hotkeys-hook";
import JsonTree from "@/components/json-tree";
import { orange } from "@mui/material/colors";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export const handleDownloadUpdateManually = () => {
  switch (process.platform) {
    case "win32":
      shell.openExternal("https://api.jstt.me/api/v2/downloads/releases/f1mvli/latest/win");
      break;
    case "darwin":
      if (process.arch === "arm64") {
        shell.openExternal("https://api.jstt.me/api/v2/downloads/releases/f1mvli/latest/mac-arm");
      } else {
        shell.openExternal("https://api.jstt.me/api/v2/downloads/releases/f1mvli/latest/mac");
      }
      break;
    case "linux":
      shell.openExternal("https://api.jstt.me/api/v2/downloads/releases/f1mvli/latest/linux");
      break;
  }
};

const handleContinueWithOutdatedVersion = () => {
  updateVars.userSkipsUpdate = true;
  window.location.hash = "/home";
};

export default function UpdateScreen(){
  const [showJSONTree, setShowJSONTree] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [updateError, setUpdateError] = useState(false);

  useHotkeys("d", () => {
    setShowJSONTree(!showJSONTree);
  });

  useEffect(() => {
    ipcRenderer.on("update-downloaded", handleUpdateDownloaded);
    ipcRenderer.on("update-error", handleUpdateError);
    return () => {
      ipcRenderer.off("update-downloaded", handleUpdateDownloaded);
      ipcRenderer.off("update-error", handleUpdateError);
    };
  }, []);

  const handleUpdateDownloaded = () => {
    setUpdateDownloaded(true);
  };
  const handleUpdateError = () => {
    setUpdateError(true);
  };

  
  return (
    <div>
      {!updateError ? (
        <>
          <LoadingScreen customText={updateDownloaded ? "Installing update..." : "Downloading update..."} />
        </>
      ) : (
        <>
          <WarningAmberRoundedIcon sx={{
            mb: 3,
            fontSize: 30,
            color: orange[500],
          }} />
          <Typography sx={{ mb: 1.5 }}>Failed to automatically update, please download the latest version manually.</Typography>
          <Button sx={{ mr: 3, mt: 4 }} onClick={handleContinueWithOutdatedVersion} color="secondary" variant="text">Continue with outdated version</Button>
          <Button sx={{ mt: 4, mr: 3 }} onClick={handleDownloadUpdateManually} color="secondary" variant="contained">Download update <ArrowForwardIcon sx={{ ml: 1 }} /></Button>
        </>
      )}
      {showJSONTree && (
        <div style={{ marginTop: 50 }}>
          <JsonTree data={{
            updateVars: updateVars,
            updateDownloaded: updateDownloaded,
            updateError: updateError,
            showJSONTree: showJSONTree,
          }} />
        </div>
      )}
    </div>
  );
}