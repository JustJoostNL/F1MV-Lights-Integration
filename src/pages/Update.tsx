import { Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import {ipcRenderer} from "electron";
import WarningIcon from "@mui/icons-material/Warning";
import LoadingScreen from "@/pages/LoadingScreen";

export default function UpdateScreen(){
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [updateError, setUpdateError] = useState(false);

  useEffect(() => {
    ipcRenderer.on("update-downloaded", handleUpdateDownloaded)
    ipcRenderer.on("update-error", handleUpdateError)
    return () => {
      ipcRenderer.off("update-downloaded", handleUpdateDownloaded)
    }
  }, [])

  const handleUpdateDownloaded = () => {
    setUpdateDownloaded(true);
  }
  const handleUpdateError = () => {
    console.log("Update error")
    setUpdateError(true);
  }

  const handleSkipUpdate = () => {
    console.log("Skipping update")
  }

  return (
    <div>
      {!updateError ? (
        <>
          <LoadingScreen customText={updateDownloaded ? "Installing update..." : "Downloading update..."} />
          {!updateDownloaded && (
            <Button sx={{mr: 2}} color="secondary" variant="outlined" onClick={handleSkipUpdate}>Skip update</Button>
          )}
        </>
      ) : (
        <>
          <WarningIcon />
          <Typography>Failed to automatically update, please download the latest version manually.</Typography>
          <Button color="secondary" variant="outlined">Continue with outdated version</Button>
          <Button color="secondary" variant="contained">Download update manually</Button>
        </>
      )}
    </div>
  )
}