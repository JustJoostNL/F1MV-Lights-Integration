import * as React from "react";
import Button from "@mui/material/Button";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import SearchIcon from "@mui/icons-material/Search";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import LightBulbIcon from "@mui/icons-material/Lightbulb";
import LinkIcon from "@mui/icons-material/Link";
import { font } from "@/index";
import ReactGA from "react-ga4";
import { saveConfig } from "@/components/settings/settings/ikea-settings/IkeaSettings";
import Toaster from "@/components/toaster/Toaster";


export default function IkeaMenu(){
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [toaster, setToaster] = React.useState<{ message: string, severity: "error" | "warning" | "info" | "success", time: number } | null>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleManageIkeaDevices = async () => {
    setAnchorEl(null);
    await saveConfig();
    await window.f1mvli.utils.openNewWindow({
      browserWindowOptions: {
        title: "Ikea Device Selector — F1MV Lights Integration",
        width: 756,
        height: 690,
        resizable: false,
        maximizable: false,
        minWidth: 756,
        minHeight: 690,
      },
      url: "/manage-ikea-devices"
    });
    ReactGA.event({
      category: "ikea_tools_menu",
      action: "manage_ikea_devices",
    });
  };
  const handleSearchAndConnect = async () => {
    setAnchorEl(null);
    const response = await window.f1mvli.integrations.ikea.searchAndConnectToGateway();
    if (response.success){
      setToaster({ message: "Successfully connected to the IKEA gateway!", severity: "success", time: 5000 });
      setTimeout(() => {
        setToaster(null);
      }, 5100);
    } else {
      const message = response.message;
      const status = response.status;
      setToaster({ message: message, severity: status, time: 5000 });
      setTimeout(() => {
        setToaster(null);
      }, 5100);
    }
    ReactGA.event({
      category: "ikea_tools_menu",
      action: "search_and_connect_to_gateway",
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
        id="ikea-menu-button"
        aria-controls={open ? "ikea-menu-button" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="contained"
        color={"secondary"}
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
                Ikea Tools
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
        <MenuItem onClick={handleSearchAndConnect}>
          <SearchIcon sx={{ mr: 0.3 }}/> + <LinkIcon sx={{ mr: 2, ml: 0.5 }}/>
          <Typography
            variant="body2"
            sx={menuItemStyle}>
            Search and connect to IKEA gateway
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleManageIkeaDevices}>
          <LightBulbIcon
            sx={{
              mr: 2
            }}/>
          <Typography
            variant="body2"
            sx={menuItemStyle}>
            Manage IKEA Devices
          </Typography>
        </MenuItem>
      </Menu>
      {toaster && <Toaster message={toaster.message} severity={toaster.severity} time={toaster.time} />}
    </div>
  );

}