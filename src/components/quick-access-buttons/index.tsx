import { Button } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import GetAppIcon from "@mui/icons-material/GetApp";
import DescriptionIcon from "@mui/icons-material/Description";
import log from "electron-log/renderer";
import ReactGA from "react-ga4";

export default function QuickAccessButtons(){
  const handleOpenConfig = () => {
    log.info("Opening config file...");
    window.f1mvli.config.openInEditor();
    ReactGA.event({
      category: "button-press",
      action: "Open Config (BP)",
    });
  };
  const handleCheckForUpdates = () => {
    log.info("Checking for updates...");
    window.f1mvli.updater.checkForUpdate();
    ReactGA.event({
      category: "button-press",
      action: "Check for Updates (BP)",
    });
  };
  const handleOpenLogFile = () => {
    log.info("Opening log file...");
    window.f1mvli.log.openLogFile();
    ReactGA.event({
      category: "button-press",
      action: "Open Log File (BP)",
    });
  };

  return (
    <div>
      <Button variant="outlined" color={"secondary"} onClick={handleOpenConfig} startIcon={<OpenInNewIcon />} sx={{ mr: 2, }}>Open Config</Button>
      <Button variant="outlined" color={"secondary"} onClick={handleCheckForUpdates} startIcon={<GetAppIcon />}>Check for Updates</Button>
      <Button variant="outlined" color={"secondary"} onClick={handleOpenLogFile} startIcon={<DescriptionIcon />} sx={{ ml: 2, }}>Open Log File</Button>
    </div>
  );
}