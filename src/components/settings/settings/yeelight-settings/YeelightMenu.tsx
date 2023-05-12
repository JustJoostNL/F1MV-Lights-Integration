import * as React from "react";
import Button from "@mui/material/Button";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import LightBulbIcon from "@mui/icons-material/Lightbulb";
import Typography from "@mui/material/Typography";
import { font } from "@/index";
import ReactGA from "react-ga4";


export default function YeelightMenu(){
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleManageYeeLightDevices = async () => {
    setAnchorEl(null);
    await window.f1mvli.utils.openNewWindow({
      browserWindowOptions: {
        title: "YeeLight Device Selector — F1MV-Lights-Integration",
        width: 756,
        height: 690,
        resizable: false,
        maximizable: false,
        minWidth: 756,
        minHeight: 690,
      },
      url: "/add-yeelight-device"
    });
    ReactGA.event({
      category: "yeelight_tools_menu",
      action: "add_yeelight_device",
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
        id="yeelight-menu-button"
        aria-controls={open ? "yeelight-menu-button" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="contained"
        color={"secondary"}
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
        YeeLight Tools
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
        <MenuItem onClick={handleManageYeeLightDevices}>
          <LightBulbIcon
            sx={{
              mr: 2
            }}/>
          <Typography
            variant="body2"
            sx={menuItemStyle}>
            Manage YeeLight Devices
          </Typography>
        </MenuItem>
      </Menu>
    </div>
  );

}