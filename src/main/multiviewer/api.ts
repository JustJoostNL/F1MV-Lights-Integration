import log from "electron-log";
import fetch from "cross-fetch";
import { isEqual } from "lodash";
import {
  IRaceControlMessages,
  ISessionData,
  ISessionInfo,
  ISessionStatus,
  ITimingData,
  ITimingStats,
  ITrackStatus,
  RaceControlMessageSubCategory,
} from "../../shared/multiviewer/graphql_api_types";
import { getConfig } from "../ipc/config";
import {
  EventType,
  eventTypeReadableMap,
} from "../../shared/config/config_types";
import { eventHandler } from "../lightController/eventHandler";

export interface ILiveTimingData {
  RaceControlMessages: IRaceControlMessages;
  SessionData: ISessionData;
  SessionInfo: ISessionInfo;
  SessionStatus: ISessionStatus;
  TimingData: ITimingData;
  TimingStats: ITimingStats;
  TrackStatus: ITrackStatus;
}

interface IGraphQLResponse {
  data: {
    liveTimingState: ILiveTimingData;
  };
}

let errorCheck: boolean = false;
export let liveTimingState: ILiveTimingData | undefined = undefined;
let currentFastestLapTimeSeconds: number = 3600; // 1 hour
//let currentFastestLapLapNumber: number | undefined = undefined;
let previousTrackStatus: ITrackStatus | undefined = undefined;
let previousSessionStatus: ISessionStatus | undefined = undefined;
let processedRaceControlMessages: IRaceControlMessages = {
  Messages: [],
};

export async function fetchMultiViewerLiveTimingData(): Promise<
  ILiveTimingData | undefined
> {
  try {
    const config = await getConfig();
    const graphqlUrl = new URL("/api/graphql", config.multiviewerLiveTimingURL);

    const res = await fetch(graphqlUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: /* GraphQL */ `
          query QueryAllLiveTimingData {
            liveTimingState {
              RaceControlMessages
              SessionData
              SessionInfo
              SessionStatus
              TimingData
              TimingStats
              TrackStatus
            }
          }
        `,
      }),
    });

    if (!res.ok) {
      if (!errorCheck) {
        errorCheck = true;
        log.warn(
          "MultiViewer GrahpQL API call failed! Error: " + res.statusText,
        );
      }
    }

    const json: IGraphQLResponse = await res.json();
    if (!json.data.liveTimingState) return;
    return json.data.liveTimingState;
  } catch (err) {
    if (!errorCheck) {
      errorCheck = true;
      log.warn("MultiViewer GrahpQL API call failed! Error: " + err.message);
    }
  }
}

export function parseLapTime(lapTime: string) {
  const [minutes, seconds, milliseconds] = lapTime
    .split(/[:.]/)
    .map((number) => parseInt(number.replace(/^0+/, "") || "0", 10));

  if (milliseconds === undefined) {
    return minutes + seconds / 1000;
  }

  return minutes * 60 + seconds + milliseconds / 1000;
}

export function getOverallFastestLapTime(
  timingDataLines: ITimingData["Lines"],
): string | undefined {
  return Object.values(timingDataLines ?? {})
    .map((line) => (line.KnockedOut === true ? "" : line.BestLapTime?.Value))
    .filter((lapTime) => lapTime !== "")
    .map((lapTime) => ({ lapTime, parsed: parseLapTime(lapTime) }))
    .sort((a, b) => a.parsed - b.parsed)[0]?.lapTime;
}

function checkForNewFastestLap(
  TimingStats: ITimingStats["Lines"],
  TimingData: ITimingData["Lines"],
) {
  for (const [driver, { Retired, Stopped }] of Object.entries(TimingData)) {
    const { PersonalBestLapTime } = TimingStats[driver];

    //if the driver is retired or stopped, skip
    if (Retired || Stopped) {
      continue;
    }

    const { Position, Value } = PersonalBestLapTime;
    const lapTimeSeconds = parseLapTime(Value);

    //if the driver fastest lap is not in first place, skip
    if (Position !== 1) {
      continue;
    }

    //if the lap time is slower than the current fastest lap, skip
    if (lapTimeSeconds >= currentFastestLapTimeSeconds) {
      continue;
    }

    //if the lap number is not greater than the current fastest lap, skip
    // if (Lap <= currentFastestLapLap) {
    //   continue;
    // }

    currentFastestLapTimeSeconds = lapTimeSeconds;
    //currentFastestLapLapNumber = Lap;
    newEventHandler(EventType.FastestLap);
  }
}

function checkForTrackStatusChange(
  TrackStatus: ITrackStatus,
  previousTrackStatus: ITrackStatus | undefined,
  SessionStatus: ISessionStatus,
  previousSessionStatus: ISessionStatus | undefined,
) {
  if (
    previousTrackStatus?.Status !== TrackStatus.Status &&
    SessionStatus.Status !== "Ends" &&
    SessionStatus.Status !== "Finalised"
  ) {
    switch (TrackStatus.Status) {
      case "1":
        newEventHandler(EventType.GreenFlag);
        break;
      case "2":
        newEventHandler(EventType.YellowFlag);
        break;
      case "4":
        newEventHandler(EventType.SafetyCar);
        break;
      case "5":
        newEventHandler(EventType.RedFlag);
        break;
      case "6":
        newEventHandler(EventType.VirtualSafetyCar);
        break;
      case "7":
        newEventHandler(EventType.VirtualSafetyCarEnding);
        break;
    }
  } else if (
    (SessionStatus.Status === "Ends" || SessionStatus.Status === "Finalised") &&
    previousSessionStatus?.Status !== SessionStatus.Status
  ) {
    newEventHandler(EventType.SessionEnded);
  }
}

function checkForNewEventsInRaceControlMessages(
  RaceControlMessages: IRaceControlMessages,
) {
  if (!RaceControlMessages.Messages) return;

  if (
    RaceControlMessages.Messages.length ===
    processedRaceControlMessages.Messages.length
  ) {
    return;
  }

  const newMessages = RaceControlMessages.Messages.filter(
    (message) =>
      !processedRaceControlMessages.Messages.find((m) => isEqual(m, message)),
  );

  if (!newMessages.length) return;

  const lastMessage = newMessages[newMessages.length - 1];

  if (lastMessage.Message.match(/CHEQUERED FLAG/i)) {
    newEventHandler(EventType.ChequeredFlag);
  }
  if (lastMessage.Message.match(/BLUE FLAG/i)) {
    newEventHandler(EventType.BlueFlag);
  }
  if (lastMessage.Message.match(/DRS ENABLED/i)) {
    newEventHandler(EventType.DrsEnabled);
  }
  if (lastMessage.Message.match(/DRS DISABLED/i)) {
    newEventHandler(EventType.DrsDisabled);
  }
  if (lastMessage.Message.match(/PIT LANE ENTRY CLOSED/i)) {
    newEventHandler(EventType.PitLaneEntryClosed);
  }
  if (lastMessage.Message.match(/PIT EXIT OPEN/i)) {
    newEventHandler(EventType.PitExitOpen);
  }
  if (lastMessage.Message.match(/PIT ENTRY CLOSED/i)) {
    newEventHandler(EventType.PitEntryClosed);
  }
  if (lastMessage.SubCategory === RaceControlMessageSubCategory.TimePenalty) {
    newEventHandler(EventType.TimePenalty);
  }

  processedRaceControlMessages = RaceControlMessages;
}

export function startLiveTimingDataPolling() {
  setInterval(async () => {
    const liveTimingData = await fetchMultiViewerLiveTimingData();
    if (!liveTimingData) return;
    liveTimingState = liveTimingData;
    checkForNewFastestLap(
      liveTimingData.TimingStats.Lines,
      liveTimingData.TimingData.Lines,
    );
    checkForTrackStatusChange(
      liveTimingData.TrackStatus,
      previousTrackStatus,
      liveTimingData.SessionStatus,
      previousSessionStatus,
    );
    checkForNewEventsInRaceControlMessages(liveTimingData.RaceControlMessages);
  }, 500);
}

function newEventHandler(event: EventType) {
  eventHandler(event);
  log.info(eventTypeReadableMap[event]);
  previousTrackStatus = liveTimingState?.TrackStatus;
  previousSessionStatus = liveTimingState?.SessionStatus;
}
