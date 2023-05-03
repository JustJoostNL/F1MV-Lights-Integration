import * as React from "react";
import Button from "@mui/material/Button";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import SearchIcon from "@mui/icons-material/Search";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import AddIcon from "@mui/icons-material/Add";
import { font } from "@/index";
import ReactGA from "react-ga4";


export default function NanoleafMenu(){
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleAddNanoleafDevice = () => {
    setAnchorEl(null);
    ReactGA.event({
      category: "nanoleaf_tools_menu",
      action: "add_nanoleaf_device",
    });
  };
  const handleViewCurrentlyConnectedNanoleafDevices = () => {
    setAnchorEl(null);
    ReactGA.event({
      category: "nanoleaf_tools_menu",
      action: "view_currently_connected_nanoleaf_devices",
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
        id="nanoleaf-menu-button"
        aria-controls={open ? "nanoleaf-menu-button" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="contained"
        color={"secondary"}
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
                Nanoleaf Tools
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
        <MenuItem onClick={handleAddNanoleafDevice}>
          <AddIcon
            sx={{
              mr: 2
            }}/>
          <Typography
            variant="body2"
            sx={menuItemStyle}>
                        Add a Nanoleaf Device
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleViewCurrentlyConnectedNanoleafDevices}>
          <SearchIcon sx={{
            mr: 2
          }}/>
          <Typography
            variant="body2"
            sx={menuItemStyle}>
                        View currently connected Nanoleaf devices
          </Typography>
        </MenuItem>
      </Menu>
    </div>
  );

}