import { Button, Tooltip } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import GetAppIcon from "@mui/icons-material/GetApp";
import DescriptionIcon from "@mui/icons-material/Description";
import log from "electron-log/renderer";
import ReactGA from "react-ga4";
import * as React from "react";
import Toaster from "@/components/toaster/Toaster";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import { font } from "@/index";
import { useEffect, useState } from "react";

export default function QuickAccessButtons(){
  const [toaster, setToaster] = React.useState<{ message: string, severity: "error" | "warning" | "info" | "success", time: number } | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(process.platform === "darwin");
  }, []);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

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
      let message = "";
      if (isMac) {
        message = `Update available! You currently have version ${updateInfo.currentVersion} installed, version ${updateInfo.newVersion} is available.`;
      } else {
        message = `Update available! Downloading version ${updateInfo.newVersion}... You will be notified when the update is ready to install.`;
      }
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
  const handleOpenLogViewer = () => {
    window.location.hash = "#/log-viewer";
    ReactGA.event({
      category: "button_press",
      action: "open_log_viewer_button_press",
    });
  };

  const menuItemStyle = {
    fontSize: "1.0rem",
    fontFamily: font,
    width: "100%",
  };

  return (
    <div>
      <Tooltip title={"Tip: You can also manage the settings on the settings page (three dots in the top right corner) instead of editing the config file."}>
        <Button variant="outlined" color={"secondary"} onClick={handleOpenConfig} startIcon={<OpenInNewIcon />} sx={{ mr: 2, }}>Open Config</Button>
      </Tooltip>
      <Button variant="outlined" color={"secondary"} onClick={handleCheckForUpdates} startIcon={<GetAppIcon />}>Check for Updates</Button>
      <Button
        sx={{ ml: 2 }}
        startIcon={<DescriptionIcon/>}
        id="view-logs-menu"
        aria-controls={open ? "view-logs-button" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="outlined"
        color={"secondary"}
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
        View Logs
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClick={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}>
        <MenuItem onClick={handleOpenLogViewer}>
          <DescriptionIcon
            sx={{
              mr: 2,
            }}/>
          <Typography
            variant="body2"
            sx={menuItemStyle}>
            Open logs in app
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleOpenLogFile}>
          <OpenInNewIcon
            sx={{
              mr: 2,
            }}/>
          <Typography
            variant="body2"
            sx={menuItemStyle}>
            Open logs in editor
          </Typography>
        </MenuItem>
      </Menu>
      {toaster && <Toaster message={toaster.message} severity={toaster.severity} time={toaster.time} />}
    </div>
  );
}