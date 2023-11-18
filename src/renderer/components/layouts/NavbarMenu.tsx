import React, { useCallback, useState } from "react";
import { IconButton, Link, ListItemIcon } from "@mui/material";
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";
import {
  MoreVert,
  Settings,
  Home,
  SavingsRounded,
  ExitToApp,
  Description,
  OpenInNewRounded,
} from "@mui/icons-material";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { green, red } from "@mui/material/colors";
import packageJson from "../../../../package.json";
//@ts-ignore
import multiviewerLogo from "../../assets/multiviewer-logo.png";

export function ThreeDotMenu() {
  const [anchorEl, setAnchorEl] = useState<undefined | HTMLElement>(undefined);

  const handleMenuOpenClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [],
  );
  const handleMenuClose = useCallback(() => {
    setAnchorEl(undefined);
  }, []);

  const handleExitApp = useCallback(() => {
    setAnchorEl(undefined);
    window.f1mvli.utils.exitApp();
  }, []);

  // get the version from package.json
  const currentAppVersion = "v" + packageJson.version;

  return (
    <>
      <IconButton color="inherit" onClick={handleMenuOpenClick}>
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose} component={Link} href="#/home">
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          Home
        </MenuItem>

        <MenuItem onClick={handleMenuClose} component={Link} href="#/settings">
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          Settings
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={handleMenuClose}
          component={Link}
          href="https://f1mvli.jstt.me/docs"
          target="_blank"
        >
          <ListItemIcon>
            <Description />
          </ListItemIcon>
          Documentation <OpenInNewRounded fontSize="inherit" sx={{ ml: 1 }} />
        </MenuItem>

        <MenuItem
          onClick={handleMenuClose}
          component={Link}
          href="https://donate.jstt.me"
          target="_blank"
        >
          <ListItemIcon>
            <SavingsRounded sx={{ color: green[500] }} />
          </ListItemIcon>
          Donate <OpenInNewRounded fontSize="inherit" sx={{ ml: 1 }} />
        </MenuItem>

        <MenuItem
          onClick={handleMenuClose}
          component={Link}
          href="multiviewer://"
          target="_blank"
        >
          <ListItemIcon>
            <img
              src={multiviewerLogo}
              alt="Multiviewer Logo"
              style={{ width: "1.5rem" }}
            />
          </ListItemIcon>
          Open Multiviewer{" "}
          <OpenInNewRounded fontSize="inherit" sx={{ ml: 1 }} />
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleExitApp}>
          <ListItemIcon>
            <ExitToApp sx={{ color: red[500] }} />
          </ListItemIcon>
          Exit
        </MenuItem>

        <Divider />

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            color: "grey.500",
            fontSize: "0.9rem",
            ml: 1,
            width: "100%",
            padding: "0.5rem",
          }}
        >
          Current version: {currentAppVersion}
        </Typography>
      </Menu>
    </>
  );
}
