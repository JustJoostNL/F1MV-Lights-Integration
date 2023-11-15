import React, { useCallback, useState } from "react";
import { IconButton } from "@mui/material";
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";
import {
  MoreVert,
  Settings,
  Home,
  OpenInNew,
  SavingsRounded,
  ExitToApp,
  Description,
} from "@mui/icons-material";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { green, red } from "@mui/material/colors";
import { shell } from "electron";
import packageJson from "../../../../package.json";
//@ts-ignore
import multiviewerLogo from "../../assets/multiviewer-logo.png";
import { font } from "../..";

export function ThreeDotMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);
  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleNavigateTo = useCallback((path: string) => {
    setAnchorEl(null);
    window.location.hash = path;
  }, []);

  const handleExitApp = useCallback(() => {
    setAnchorEl(null);
    window.f1mvli.utils.exitApp();
  }, []);

  const handleOpenExtUrl = useCallback((url: string) => {
    setAnchorEl(null);
    shell.openExternal(url);
  }, []);

  // get the version from package.json
  const currentAppVersion = "v" + packageJson.version;

  const menuItemStyle = {
    fontSize: "1.0rem",
    fontFamily: font,
    width: "100%",
  };

  return (
    <div>
      <IconButton
        aria-label="more"
        color="inherit"
        aria-controls={open ? "long-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={() => handleNavigateTo("/home")}>
          <Home
            sx={{
              mr: 2,
            }}
          />
          <Typography variant="body2" sx={menuItemStyle}>
            Home
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleNavigateTo("/settings")}>
          <Settings
            sx={{
              mr: 2,
            }}
          />
          <Typography variant="body2" sx={menuItemStyle}>
            Settings
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleOpenExtUrl("https://f1mvli.jstt.me")}>
          <Description
            sx={{
              mr: 2,
            }}
          />
          <Typography variant="body2" sx={menuItemStyle}>
            Documentation
            <OpenInNew
              sx={{
                ml: 1,
                color: "grey.500",
                fontSize: "0.9rem",
              }}
            />
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleOpenExtUrl("https://donate.jstt.me")}>
          <SavingsRounded
            sx={{
              mr: 2,
              color: green[500],
            }}
          />
          <Typography variant="body2" sx={menuItemStyle}>
            Donate
            <OpenInNew
              sx={{
                ml: 1,
                color: "grey.500",
                fontSize: "0.9rem",
              }}
            />
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleOpenExtUrl("multiviewer://")}>
          <img
            src={multiviewerLogo}
            alt="MultiViewer Logo"
            style={{
              width: "1.5rem",
              marginRight: "1rem",
            }}
          />
          <Typography variant="body2" sx={menuItemStyle}>
            Open MultiViewer
            <OpenInNew
              sx={{
                ml: 1,
                color: "grey.500",
                fontSize: "0.9rem",
              }}
            />
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleExitApp}>
          <ExitToApp
            sx={{
              mr: 2,
              color: red[500],
            }}
          />
          <Typography variant="body2" sx={menuItemStyle}>
            Exit
          </Typography>
        </MenuItem>
        <Divider />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            color: "grey.500",
            fontSize: "0.9rem",
            fontFamily: font,
            ml: 1,
            width: "100%",
            padding: "0.5rem",
          }}
        >
          Current version: {currentAppVersion}
        </Typography>
      </Menu>
    </div>
  );
}
