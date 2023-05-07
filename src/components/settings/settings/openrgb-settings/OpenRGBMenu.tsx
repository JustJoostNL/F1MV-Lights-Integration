import * as React from "react";
import Button from "@mui/material/Button";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { font } from "@/index";
import ReactGA from "react-ga4";
import Toaster from "@/components/toaster/Toaster";
import RefreshIcon from "@mui/icons-material/Refresh";


export default function OpenRGBMenu(){
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [toaster, setToaster] = React.useState<{ message: string, severity: "error" | "warning" | "info", time: number } | null>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleReConnectToOpenRGB = async () => {
    setAnchorEl(null);
    ReactGA.event({
      category: "openrgb_tools_menu",
      action: "reconnect_to_openrgb",
    });
    const reConnectionStatus: boolean = await window.f1mvli.integrations.openRGB.reConnect();
    if (reConnectionStatus) {
      setToaster({ message: "Successfully (re)connected to OpenRGB!", severity: "info", time: 5000 });
      setTimeout(() => {
        setToaster(null);
      }, 5100);
    } else {
      setToaster({ message: "Failed to (re)connect to OpenRGB, please check the logs to see the error!", severity: "warning", time: 5000 });
      setTimeout(() => {
        setToaster(null);
      }, 5100);
    }
  };


  const menuItemStyle = {
    fontSize: "1.0rem",
    fontFamily: font,
    width: "100%",
  };

  return (
    <div>
      <Button
        id="openrgb-menu-button"
        aria-controls={open ? "openrgb-menu-button" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="contained"
        color={"secondary"}
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
        OpenRGB Tools
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
        <MenuItem onClick={handleReConnectToOpenRGB}>
          <RefreshIcon
            sx={{
              mr: 2
            }}/>
          <Typography
            variant="body2"
            sx={menuItemStyle}>
            (Re)connect to OpenRGB
          </Typography>
        </MenuItem>
      </Menu>
      {toaster && <Toaster message={toaster.message} severity={toaster.severity} time={toaster.time} />}
    </div>
  );
}