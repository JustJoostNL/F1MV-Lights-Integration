import React, { useCallback, useMemo, useState } from "react";
import {
  KeyboardArrowDown,
  DirectionsCar,
  Flag,
  MinorCrash,
  FlashOff,
  NoCrash,
  Timer,
  CheckCircle,
  DoneAllRounded,
  SportsScoreRounded,
  BlockRounded,
  LogoutRounded,
  CancelRounded,
  SquareRounded,
} from "@mui/icons-material";
import { ListItemIcon, Button, Menu, MenuItem, Divider } from "@mui/material";
import { blue, green, red } from "@mui/material/colors";
import {
  EventType,
  eventTypeReadableMap,
} from "../../../shared/config/config_types";
import { useConfig } from "../../hooks/useConfig";

interface Item {
  name: string;
  icon: JSX.Element;
  cta: () => void;
  hidden: boolean;
}

const icons = {
  [EventType.GreenFlag]: <Flag sx={{ color: green[500] }} />,
  [EventType.YellowFlag]: <Flag sx={{ color: "yellow" }} />,
  [EventType.BlueFlag]: <Flag sx={{ color: blue[500] }} />,
  [EventType.RedFlag]: <Flag sx={{ color: "red" }} />,
  [EventType.SafetyCar]: <MinorCrash sx={{ color: "yellow" }} />,
  [EventType.VirtualSafetyCar]: <DirectionsCar sx={{ color: "yellow" }} />,
  [EventType.VirtualSafetyCarEnding]: <NoCrash sx={{ color: "yellow" }} />,
  [EventType.FastestLap]: <Timer sx={{ color: "#e801fe" }} />,
  [EventType.TimePenalty]: <Timer sx={{ color: red[500] }} />,
  [EventType.SessionEnded]: <DoneAllRounded sx={{ color: green[500] }} />,
  [EventType.DrsEnabled]: <CheckCircle sx={{ color: green[500] }} />,
  [EventType.DrsDisabled]: <CancelRounded sx={{ color: red[500] }} />,
  [EventType.ChequeredFlag]: <SportsScoreRounded />,
  [EventType.PitEntryClosed]: <LogoutRounded sx={{ color: red[500] }} />,
  [EventType.PitLaneEntryClosed]: <BlockRounded sx={{ color: red[500] }} />,
  [EventType.PitExitOpen]: <LogoutRounded sx={{ color: green[500] }} />,
};

export function SimulationMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { config } = useConfig();

  const usedEventTriggers = useMemo(() => {
    return config.events
      .filter((event) => event.enabled)
      .map((event) => event.triggers)
      .flat();
  }, [config]);

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
    (event: EventType) => {
      window.f1mvli.eventManager.simulate(event);
      handleClose();
    },
    [handleClose],
  );

  const handleSimulateBackToStatic = useCallback(() => {
    window.f1mvli.eventManager.simulateBackToStatic();
    handleClose();
  }, [handleClose]);

  const handleOnAllLightsOff = useCallback(() => {
    window.f1mvli.eventManager.allOff();
    handleClose();
  }, [handleClose]);

  const items: Item[] = Object.values(EventType).map((event) => {
    return {
      name: eventTypeReadableMap[event],
      icon: icons[event],
      cta: () => handleOnSimulateEvent(event),
      hidden: !usedEventTriggers.includes(event),
    };
  });

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
        sx={{
          maxHeight: 450,
        }}
      >
        {items
          .filter((item) => !item.hidden)
          .map((item) => (
            <MenuItem key={item.name} onClick={item.cta}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              {item.name}
            </MenuItem>
          ))}
        <Divider />
        <MenuItem onClick={handleSimulateBackToStatic}>
          <ListItemIcon>
            <SquareRounded />
          </ListItemIcon>
          Back to static color
        </MenuItem>
        <MenuItem onClick={handleOnAllLightsOff}>
          <ListItemIcon>
            <FlashOff />
          </ListItemIcon>
          Turn off all lights
        </MenuItem>
      </Menu>
    </div>
  );
}
