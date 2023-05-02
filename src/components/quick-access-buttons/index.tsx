import { Button } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import GetAppIcon from "@mui/icons-material/GetApp";
import DescriptionIcon from "@mui/icons-material/Description";
import log from "electron-log/renderer";

export default function QuickAccessButtons(){
  const handleOpenConfig = () => {
    log.info("Opening config file...");
    window.f1mvli.config.openInEditor();
  };
  const handleCheckForUpdates = () => {
    log.info("Checking for updates...");
    window.f1mvli.updater.checkForUpdate();
  };
  const handleOpenLogFile = () => {
    log.info("Opening log file...");
    window.f1mvli.log.openLogFile();
  };

  return (
    <div>
      <Button variant="outlined" color={"secondary"} onClick={handleOpenConfig} startIcon={<OpenInNewIcon />} sx={{ mr: 2, }}>Open Config</Button>
      <Button variant="outlined" color={"secondary"} onClick={handleCheckForUpdates} startIcon={<GetAppIcon />}>Check for Updates</Button>
      <Button variant="outlined" color={"secondary"} onClick={handleOpenLogFile} startIcon={<DescriptionIcon />} sx={{ ml: 2, }}>Open Log File</Button>
    </div>
  );
}