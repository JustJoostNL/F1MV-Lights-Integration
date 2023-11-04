import { Button, Tooltip } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import GetAppIcon from "@mui/icons-material/GetApp";
import DescriptionIcon from "@mui/icons-material/Description";
import log from "electron-log/renderer";
import * as React from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import { enqueueSnackbar } from "notistack";
import { font } from "../..";

export function QuickAccessButtons() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenConfig = () => {
    log.info("Opening config file...");
    window.f1mvli.config.open();
  };
  const handleCheckForUpdates = async () => {
    await window.f1mvli.updater.checkForUpdates();
    const updateInfo = await window.f1mvli.updater.getUpdateAvailable();
    if (updateInfo.updateAvailable) {
      enqueueSnackbar("Update available! Downloading...", { variant: "info" });
    } else {
      enqueueSnackbar("No update available.", { variant: "success" });
    }
  };
  const handleOpenLogFile = () => {
    log.info("Opening log file...");
    window.f1mvli.logger.openLogFile();
  };
  const handleOpenLogViewer = () => {
    window.location.hash = "#/log-viewer";
  };

  const menuItemStyle = {
    fontSize: "1.0rem",
    fontFamily: font,
    width: "100%",
  };

  return (
    <div>
      <Tooltip title="Tip: You can also manage the settings on the settings page (three dots in the top right corner) instead of editing the config file.">
        <Button variant="outlined" color="secondary" onClick={handleOpenConfig} startIcon={<OpenInNewIcon />} sx={{ mr: 2, }}>Open Config</Button>
      </Tooltip>
      <Button variant="outlined" color="secondary" onClick={handleCheckForUpdates} startIcon={<GetAppIcon />}>Check for Updates</Button>
      <Button
        sx={{ ml: 2 }}
        startIcon={<DescriptionIcon/>}
        id="view-logs-menu"
        aria-controls={open ? "view-logs-button" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="outlined"
        color="secondary"
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
    </div>
  );
}
