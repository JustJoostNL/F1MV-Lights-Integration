import React, { useCallback, useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
  Flag,
  MinorCrash,
  DirectionsCar,
  Square,
  Timer,
  FlashOff,
  NoCrash,
} from "@mui/icons-material";
import { ipcRenderer } from "electron";
import { ListItemIcon, Tooltip } from "@mui/material";
import { green } from "@mui/material/colors";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";

export function SimulationMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [setAnchorEl],
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleOnSimulateEvent = useCallback(
    (event: string, arg: string) => {
      ipcRenderer.send(event, arg);
      handleClose();
    },
    [handleClose],
  );

  return (
    <div>
      <Button
        variant="contained"
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDown />}
      >
        Simulate Event
      </Button>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClick={handleClose}
      >
        <MenuItem onClick={() => handleOnSimulateEvent("flagSim", "Green")}>
          <ListItemIcon>
            <Flag sx={{ color: green[500] }} />
          </ListItemIcon>
          Green Flag
        </MenuItem>

        <MenuItem onClick={() => handleOnSimulateEvent("flagSim", "Yellow")}>
          <ListItemIcon>
            <Flag sx={{ color: "yellow" }} />
          </ListItemIcon>
          Yellow Flag
        </MenuItem>

        <MenuItem onClick={() => handleOnSimulateEvent("flagSim", "Red")}>
          <ListItemIcon>
            <Flag sx={{ color: "red" }} />
          </ListItemIcon>
          Red Flag
        </MenuItem>

        <MenuItem onClick={() => handleOnSimulateEvent("flagSim", "SC")}>
          <ListItemIcon>
            <MinorCrash sx={{ color: "yellow" }} />
          </ListItemIcon>
          Safety Car
        </MenuItem>

        <MenuItem onClick={() => handleOnSimulateEvent("flagSim", "VSC")}>
          <ListItemIcon>
            <DirectionsCar sx={{ color: "yellow" }} />
          </ListItemIcon>
          Virtual Safety Car
        </MenuItem>

        <MenuItem onClick={() => handleOnSimulateEvent("flagSim", "vscEnding")}>
          <ListItemIcon>
            <NoCrash sx={{ color: "yellow" }} />
          </ListItemIcon>
          Virtual Safety Car Ending
        </MenuItem>

        <Tooltip
          arrow
          title="This will only work when you have a fastest lap effect created and enabled."
        >
          <MenuItem
            onClick={() => handleOnSimulateEvent("flagSim", "fastestLap")}
          >
            <ListItemIcon>
              <Timer sx={{ color: "#e801fe" }} />
            </ListItemIcon>
            Fastest Lap
          </MenuItem>
        </Tooltip>

        <MenuItem
          onClick={() => handleOnSimulateEvent("flagSim", "staticColor")}
        >
          <ListItemIcon>
            <Square sx={{ borderRadius: 10 }} />
          </ListItemIcon>
          Static Color
        </MenuItem>

        <MenuItem onClick={() => handleOnSimulateEvent("flagSim", "alloff")}>
          <ListItemIcon>
            <FlashOff />
          </ListItemIcon>
          Turn off all lights
        </MenuItem>
      </Menu>
    </div>
  );
}
