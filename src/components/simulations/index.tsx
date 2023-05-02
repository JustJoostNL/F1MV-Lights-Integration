import * as React from "react";
import { font } from "@/index";
import Button from "@mui/material/Button";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import FlagIcon from "@mui/icons-material/Flag";
import MinorCrashIcon from "@mui/icons-material/MinorCrash";
import DirectionsCar from "@mui/icons-material/DirectionsCar";
import NoCrash from "@mui/icons-material/NoCrash";
import FlashOff from "@mui/icons-material/FlashOff";
import { ipcRenderer } from "electron";

export default function SimulationMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleGreenFlag = () => {
    ipcRenderer.send("flagSim", "Green");
    handleClose();
  };
  const handleYellowFlag = () => {
    ipcRenderer.send("flagSim", "Yellow");
    handleClose();
  };
  const handleRedFlag = () => {
    ipcRenderer.send("flagSim", "Red");
    handleClose();
  };
  const handleSafetyCar = () => {
    ipcRenderer.send("flagSim", "SC");
    handleClose();
  };
  const handleVirtualSafetyCar = () => {
    ipcRenderer.send("flagSim", "VSC");
    handleClose();
  };
  const handleVirtualSafetyCarEnding = () => {
    ipcRenderer.send("flagSim", "vscEnding");
    handleClose();
  };
  const handleAllOff = () => {
    ipcRenderer.send("flagSim", "alloff");
    handleClose();
  };

  const menuItemStyle = {
    fontSize: "1.0rem",
    fontFamily: font,
    width: "100%",
  };

  return (
    <div>
      <Button
        id="sim-menu-button"
        aria-controls={open ? "sim-menu-button" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="contained"
        color={"secondary"}
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
                Simulate Flag
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClick={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={handleGreenFlag}>
          <FlagIcon
            sx={{
              mr: 2,
              color: "green"
            }}/>
          <Typography
            variant="body2"
            sx={menuItemStyle}>
                        Green Flag
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleYellowFlag}>
          <FlagIcon
            sx={{
              mr: 2,
              color: "yellow"
            }}/>
          <Typography
            variant="body2"
            sx={menuItemStyle}>
                        Yellow Flag
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleRedFlag}>
          <FlagIcon
            sx={{
              mr: 2,
              color: "red"
            }}/>
          <Typography
            variant="body2"
            sx={menuItemStyle}>
                        Red Flag
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleSafetyCar}>
          <MinorCrashIcon
            sx={{
              mr: 2,
              color: "yellow"
            }}/>
          <Typography
            variant="body2"
            sx={menuItemStyle}>
                        Safety Car
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleVirtualSafetyCar}>
          <DirectionsCar
            sx={{
              mr: 2,
              color: "yellow"
            }}/>
          <Typography
            variant="body2"
            sx={menuItemStyle}>
                        Virtual Safety Car
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleVirtualSafetyCarEnding}>
          <NoCrash
            sx={{
              mr: 2,
              color: "yellow"
            }}/>
          <Typography
            variant="body2"
            sx={menuItemStyle}>
                        Virtual Safety Car Ending
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleAllOff}>
          <FlashOff
            sx={{
              mr: 2
            }}/>
          <Typography
            variant="body2"
            sx={menuItemStyle}>
                        All lights off
          </Typography>
        </MenuItem>
      </Menu>
    </div>
  );
}