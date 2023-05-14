import { Button } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import GetAppIcon from "@mui/icons-material/GetApp";
import DescriptionIcon from "@mui/icons-material/Description";
import log from "electron-log/renderer";
import ReactGA from "react-ga4";
import * as React from "react";
import Toaster from "@/components/toaster/Toaster";
import { UpdateCheckResult } from "electron-updater";

export default function QuickAccessButtons(){
  const [toaster, setToaster] = React.useState<{ message: string, severity: "error" | "warning" | "info" | "success", time: number } | null>(null);

  const handleOpenConfig = () => {
    log.info("Opening config file...");
    window.f1mvli.config.openInEditor();
    ReactGA.event({
      category: "button_press",
      action: "open_config_button_press",
    });
  };
  const handleCheckForUpdates = async () => {
    await window.f1mvli.updater.checkForUpdates();
    const updateInfo = await window.f1mvli.updater.getUpdateAvailable();
    if (updateInfo.updateAvailable) {
      const message = `Update available! Downloading version v${updateInfo.newVersion}... You will be notified when the update is ready to install.`;
      setToaster({ message: message, severity: "success", time: 5000 });
      setTimeout(() => {
        setToaster(null);
      }, 5200);
    } else {
      setToaster({ message: "There are no updates available.", severity: "info", time: 3000 });
      setTimeout(() => {
        setToaster(null);
      }, 3100);
    }
    ReactGA.event({
      category: "button_press",
      action: "check_for_updates_button_press",
    });
  };
  const handleOpenLogFile = () => {
    log.info("Opening log file...");
    window.f1mvli.log.openLogFile();
    ReactGA.event({
      category: "button_press",
      action: "open_log_file_button_press",
    });
  };

  return (
    <div>
      <Button variant="outlined" color={"secondary"} onClick={handleOpenConfig} startIcon={<OpenInNewIcon />} sx={{ mr: 2, }}>Open Config</Button>
      <Button variant="outlined" color={"secondary"} onClick={handleCheckForUpdates} startIcon={<GetAppIcon />}>Check for Updates</Button>
      <Button variant="outlined" color={"secondary"} onClick={handleOpenLogFile} startIcon={<DescriptionIcon />} sx={{ ml: 2, }}>Open Log File</Button>
      {toaster && <Toaster message={toaster.message} severity={toaster.severity} time={toaster.time} />}
    </div>
  );
}