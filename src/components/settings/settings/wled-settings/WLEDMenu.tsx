import * as React from "react";
import Button from "@mui/material/Button";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import LightBulbIcon from "@mui/icons-material/Lightbulb";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import { font } from "@/index";
import ReactGA from "react-ga4";


export default function WLEDMenu(){
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleAddWLEDDevice = async () => {
    setAnchorEl(null);
    await window.f1mvli.utils.openNewWindow({
      browserWindowOptions: {
        title: "WLED Device Selector — F1MV Lights Integration",
        width: 756,
        height: 690,
        resizable: false,
        maximizable: false,
        minWidth: 756,
        minHeight: 690,
      },
      url: "/add-wled-device"
    });
    ReactGA.event({
      category: "wled_tools_menu",
      action: "add_wled_device",
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
        id="wled-menu-button"
        aria-controls={open ? "wled-menu-button" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="contained"
        color={"secondary"}
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
                WLED Tools
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
        <MenuItem onClick={handleAddWLEDDevice}>
          <LightBulbIcon
            sx={{
              mr: 2
            }}/>
          <Typography
            variant="body2"
            sx={menuItemStyle}>
            Manage WLED Devices
          </Typography>
        </MenuItem>
      </Menu>
    </div>
  );

}