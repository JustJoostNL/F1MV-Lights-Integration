import { Box, Button, Link, ListItemIcon } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import GetAppIcon from "@mui/icons-material/GetApp";
import DescriptionIcon from "@mui/icons-material/Description";
import log from "electron-log/renderer";
import React, { useCallback, useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import { enqueueSnackbar } from "notistack";
import { SimulationMenu } from "./SimulationMenu";

export function QuickAccessButtons() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleCheckForUpdates = useCallback(async () => {
    await window.f1mvli.updater.checkForUpdates();
    const updateAvailable = await window.f1mvli.updater.getUpdateAvailable();
    if (updateAvailable) {
      enqueueSnackbar("Update available! Downloading...", { variant: "info" });
    } else {
      enqueueSnackbar("No update available.", { variant: "success" });
    }
  }, []);

  const handleOpenLogFile = useCallback(() => {
    handleCloseMenu();
    log.info("Opening log file...");
    window.f1mvli.logger.openLogFile();
  }, [handleCloseMenu]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 1.5,
        mb: 5,
      }}
    >
      <Button
        variant="outlined"
        onClick={handleCheckForUpdates}
        startIcon={<GetAppIcon />}
      >
        Check for Updates
      </Button>

      <SimulationMenu />

      <Button
        startIcon={<DescriptionIcon />}
        variant="outlined"
        disableElevation
        onClick={handleMenuOpen}
        endIcon={<KeyboardArrowDownIcon />}
      >
        View Logs
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClick={handleCloseMenu}
      >
        <MenuItem
          onClick={handleCloseMenu}
          component={Link}
          href="#/log-viewer"
        >
          <ListItemIcon>
            <DescriptionIcon />
          </ListItemIcon>
          Open logs in app
        </MenuItem>

        <MenuItem onClick={handleOpenLogFile}>
          <ListItemIcon>
            <OpenInNewIcon />
          </ListItemIcon>
          Open logs in editor
        </MenuItem>
      </Menu>
    </Box>
  );
}
