import * as React from "react";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Menu from "@mui/material/Menu";
import Typography from "@mui/material/Typography";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { font } from "@/index";
import ReactGA from "react-ga4";
import Toaster from "@/components/toaster/Toaster";

export default function HueMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [toaster, setToaster] = React.useState<{ message: string, severity: "error" | "warning" | "info", time: number } | null>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDiscoverData = async (data: {
    status: string
    errorCode: number
    ip: string,
    message: string
  }) => {
    const status = data;
    if (status.status === "success"){
      const ip = status.ip
      setToaster({ message: `Successfully found Hue Bridge at ${ip}`, severity: "info", time: 5000 });
      setTimeout(() => {
        setToaster(null);
      }, 5100);
    } else {
      const message = status.message
      setToaster({ message: message, severity: "warning", time: 5000 });
      setTimeout(() => {
        setToaster(null);
      }, 5100);
    }
  };

  const handleSelectHueDevices = () => {
    setAnchorEl(null);
    ReactGA.event({
      category: "hue_tools_menu",
      action: "select_hue_devices",
    });
  };
  const handleSelectHueEntertainmentZones = () => {
    setAnchorEl(null);
    ReactGA.event({
      category: "hue_tools_menu",
      action: "select_hue_entertainment_zones",
    });
  };
  const handleSearchForHueBridgesLocal = async () => {
    setAnchorEl(null);
    setToaster({ message: `Searching...`, severity: "info", time: 3000 });
    setTimeout(() => {
      setToaster(null);
    }, 3100);
    const status = await window.f1mvli.integrations.hue.discoverBridge("local")
    await handleDiscoverData(status)
    ReactGA.event({
      category: "hue_tools_menu",
      action: "search_for_hue_bridges_local",
    });
  }
  const handleSearchForHueBridgesRemote = async () => {
    setAnchorEl(null);
    const status = await window.f1mvli.integrations.hue.discoverBridge("remote")
    await handleDiscoverData(status)
    ReactGA.event({
      category: "hue_tools_menu",
      action: "search_for_hue_bridges_remote",
    });
  };
  const handleRefreshHueDevices = () => {
    setAnchorEl(null);
    ReactGA.event({
      category: "hue_tools_menu",
      action: "refresh_hue_devices",
    });
  };



  const menuItemStyle = {
    fontSize: "1.0rem",
    fontFamily: font,
    width: "100%",
  };

  return (
    <div>
      <Button
        id="hue-menu-button"
        aria-controls={open ? "hue-menu-button" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="contained"
        color={"secondary"}
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
                Hue Tools
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={handleSearchForHueBridgesLocal}>
          <SearchIcon
            sx={{
              mr: 2
            }}/>
          <Typography
            variant="body2"
            sx={menuItemStyle}>
                        Search for Hue bridges (local discovery)
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleSearchForHueBridgesRemote}>
          <SearchIcon
            sx={{
              mr: 2
            }}/>
          <Typography
            variant="body2"
            sx={menuItemStyle}>
                        Search for Hue bridges (remote discovery)
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem disabled onClick={handleRefreshHueDevices}>
          <RefreshIcon
            sx={{
              mr: 2
            }}/>
          <Typography
            variant="body2"
            sx={menuItemStyle}>
                        Refresh devices from Hue bridge
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleSelectHueDevices}>
          <AddIcon
            sx={{
              mr: 2
            }}/>
          <Typography
            variant="body2"
            sx={menuItemStyle}>
                        Select Hue devices
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={handleSelectHueEntertainmentZones}>
          <AddIcon
            sx={{
              mr: 2
            }}/>
          <Typography
            variant="body2"
            sx={menuItemStyle}>
                        Select Hue entertainment zones
          </Typography>
        </MenuItem>
      </Menu>
      {toaster && <Toaster message={toaster.message} severity={toaster.severity} time={toaster.time} />}
    </div>
  );
}