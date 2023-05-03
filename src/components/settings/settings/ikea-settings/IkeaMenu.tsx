import * as React from "react";
import Button from "@mui/material/Button";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import SearchIcon from "@mui/icons-material/Search";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";
import { font } from "@/index";
import ReactGA from "react-ga4";


export default function IkeaMenu(){
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleSelectIkeaDevices = () => {
    setAnchorEl(null);
    ReactGA.event({
      category: "ikea_tools_menu",
      action: "select_ikea_devices",
    });
  };
  const handleSearchAndConnect = () => {
    setAnchorEl(null);
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
                        Search and connect to Ikea gateway
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleSelectIkeaDevices}>
          <AddIcon
            sx={{
              mr: 2
            }}/>
          <Typography
            variant="body2"
            sx={menuItemStyle}>
                        Select Ikea Devices
          </Typography>
        </MenuItem>
      </Menu>
    </div>
  );

}