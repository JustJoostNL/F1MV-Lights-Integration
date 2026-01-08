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
  ScheduleRounded,
  UpdateRounded,
  CloseRounded,
  RestoreRounded,
  CircleRounded,
  GestureRounded,
  RefreshRounded,
  CallMissedRounded,
  LocalHospitalRounded,
  EditRounded,
  QueryStatsRounded,
  YoutubeSearchedForRounded,
  SearchOffRounded,
  StopCircleRounded,
  TimerOffRounded,
} from "@mui/icons-material";
import {
  ListItemIcon,
  Button,
  Menu,
  MenuItem,
  Divider,
  createSvgIcon,
} from "@mui/material";
import { blue, green, red } from "@mui/material/colors";
import {
  EventType,
  eventTypeReadableMap,
} from "../../../shared/types/config";
import { useConfig } from "../../hooks/useConfig";

interface Item {
  name: string;
  icon: JSX.Element;
  cta: () => void;
  hidden: boolean;
}

const SlipperyIcon = createSvgIcon(
  <path d="M9.5,11H10.5C10.8,11 11,10.8 11,10.5V9H19V10.5C19,10.8 19.2,11 19.5,11H20.5C20.8,11 21,10.8 21,10.5V9L21,8.5V6L19.6,1.7C19.5,1.3 19.1,1 18.7,1H11.4C11,1 10.6,1.3 10.5,1.7L9,6V8.5L9,9V10.5C9,10.8 9.2,11 9.5,11M11.3,2H18.6L19.5,5H10.4L11.3,2M12,23H10C10,22.2 8.1,21.5 6.6,20.9C4.5,20.1 2,19.2 2,17C2,14.7 4.3,14.1 6.2,13.5C7.9,13.1 9,12.7 9,12H11C11,14.3 8.7,14.9 6.8,15.5C5.1,15.9 4,16.3 4,17C4,17.8 5.9,18.5 7.4,19.1C9.5,19.9 12,20.8 12,23M22,23H20C20,22.2 18.1,21.5 16.6,20.9C14.5,20.1 12,19.2 12,17C12,14.7 14.3,14.1 16.2,13.5C17.8,13 19,12.7 19,12H21C21,14.3 18.7,14.9 16.8,15.5C15.2,15.9 14,16.3 14,17C14,17.8 15.9,18.5 17.4,19.1C19.5,19.9 22,20.8 22,23Z" />,
  "SlipperyIcon",
);

//maybe needed later on for weather event
// const RainIcon = createSvgIcon(
//   <path d="M9,12C9.53,12.14 9.85,12.69 9.71,13.22L8.41,18.05C8.27,18.59 7.72,18.9 7.19,18.76C6.65,18.62 6.34,18.07 6.5,17.54L7.78,12.71C7.92,12.17 8.47,11.86 9,12M13,12C13.53,12.14 13.85,12.69 13.71,13.22L11.64,20.95C11.5,21.5 10.95,21.8 10.41,21.66C9.88,21.5 9.56,20.97 9.7,20.43L11.78,12.71C11.92,12.17 12.47,11.86 13,12M17,12C17.53,12.14 17.85,12.69 17.71,13.22L16.41,18.05C16.27,18.59 15.72,18.9 15.19,18.76C14.65,18.62 14.34,18.07 14.5,17.54L15.78,12.71C15.92,12.17 16.47,11.86 17,12M17,10V9A5,5 0 0,0 12,4C9.5,4 7.45,5.82 7.06,8.19C6.73,8.07 6.37,8 6,8A3,3 0 0,0 3,11C3,12.11 3.6,13.08 4.5,13.6V13.59C5,13.87 5.14,14.5 4.87,14.96C4.59,15.43 4,15.6 3.5,15.32V15.33C2,14.47 1,12.85 1,11A5,5 0 0,1 6,6C7,3.65 9.3,2 12,2C15.43,2 18.24,4.66 18.5,8.03L19,8A4,4 0 0,1 23,12C23,13.5 22.2,14.77 21,15.46V15.46C20.5,15.73 19.91,15.57 19.63,15.09C19.36,14.61 19.5,14 20,13.72V13.73C20.6,13.39 21,12.74 21,12A2,2 0 0,0 19,10H17Z" />,
//   "RainIcon",
// );

const icons: Record<EventType, JSX.Element> = {
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
  [EventType.SessionStartDelayed]: <ScheduleRounded sx={{ color: red[500] }} />,
  [EventType.SessionDurationChanged]: <UpdateRounded />,
  [EventType.LapTimeDeleted]: <CloseRounded sx={{ color: red[500] }} />,
  [EventType.LapTimeReinstated]: <RestoreRounded />,
  [EventType.LappedCarsMayOvertake]: <CircleRounded />,
  [EventType.LappedCarsMayNotOvertake]: <CircleRounded />,
  [EventType.NormalGripConditions]: <CheckCircle />,
  [EventType.OffTrackAndContinued]: <GestureRounded />,
  [EventType.SpunAndContinued]: <RefreshRounded />,
  [EventType.MissedApex]: <CallMissedRounded />,
  [EventType.CarStopped]: <MinorCrash sx={{ color: red[500] }} />,
  [EventType.MedicalCar]: <LocalHospitalRounded />,
  [EventType.IncidentNoted]: <EditRounded />,
  [EventType.IncidentUnderInvestigation]: <QueryStatsRounded />,
  [EventType.IncidentInvestigationAfterSession]: <YoutubeSearchedForRounded />,
  [EventType.IncidentNoFurtherAction]: <SearchOffRounded />,
  [EventType.IncidentNoFurtherInvestigation]: <SearchOffRounded />,
  [EventType.StopGoPenalty]: <StopCircleRounded sx={{ color: red[500] }} />,
  [EventType.TrackSurfaceSlippery]: <SlipperyIcon />,
  [EventType.LowGripConditions]: <SlipperyIcon />,
  [EventType.SessionStartAborted]: <CloseRounded sx={{ color: red[500] }} />,
  [EventType.DriveThroughPenalty]: <TimerOffRounded sx={{ color: red[500] }} />,
};

export function SimulationMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { config } = useConfig();

  const usedEventTriggers = useMemo(
    () =>
      config.events
        .filter((event) => event.enabled)
        .map((event) => event.triggers)
        .flat(),
    [config.events],
  );

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

  const items: Item[] = useMemo(
    () =>
      Object.values(EventType).map((event) => {
        return {
          name: eventTypeReadableMap[event],
          icon: icons[event],
          cta: () => handleOnSimulateEvent(event),
          hidden: !usedEventTriggers.includes(event),
        };
      }),
    [usedEventTriggers, handleOnSimulateEvent],
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
