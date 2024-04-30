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
  RaceControlMessages: IRaceControlMessages | undefined;
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
let currentQualifyingPart: number | undefined = undefined;
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

export async function checkMultiViewerAPIStatus() {
  const config = await getConfig();
  const heartbeatUrl = new URL(
    "/api/v1/live-timing/Heartbeat",
    config.multiviewerLiveTimingURL,
  );

  try {
    const res = await fetch(heartbeatUrl.toString(), {
      method: "GET",
    });
    const json = await res.json();

    if (json.error !== "No data found, do you have live timing running?") {
      log.debug("MultiViewer API is online.");
      return true;
    } else {
      log.debug("MultiViewer API is offline.");
      return false;
    }
  } catch (err) {
    return false;
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
  _TimingStats: ITimingStats["Lines"],
  TimingData: ITimingData["Lines"],
) {
  const fastestLapTimeSeconds = Object.values(TimingData ?? {})
    .map((line) => {
      if (line.KnockedOut === true) return "";
      if (line.Retired === true) return "";
      if (line.Stopped === true) return "";
      // if (TimingStats[line.RacingNumber]?.PersonalBestLapTime.Position !== 1) {
      //   return "";
      // }
      return line.BestLapTime?.Value;
    })
    .filter((lapTime) => lapTime !== "")
    .map((lapTime) => ({ lapTime, parsed: parseLapTime(lapTime) }))
    .sort((a, b) => a.parsed - b.parsed)[0]?.parsed;

  if (fastestLapTimeSeconds === undefined) return;

  if (fastestLapTimeSeconds >= currentFastestLapTimeSeconds) {
    return;
  }

  currentFastestLapTimeSeconds = fastestLapTimeSeconds;
  newEventHandler(EventType.FastestLap);
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
  RaceControlMessages: IRaceControlMessages | undefined,
) {
  if (!RaceControlMessages || !RaceControlMessages.Messages) return;

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

function checkForNewQualifyingPart() {
  if (liveTimingState?.SessionInfo.Type !== "Qualifying") return;

  const qualifyingPart = liveTimingState?.SessionData.Series
    ? liveTimingState?.SessionData.Series[
        liveTimingState?.SessionData.Series.length - 1
      ]?.QualifyingPart
    : null;

  if (qualifyingPart === null) return;

  if (currentQualifyingPart !== qualifyingPart) {
    if (typeof currentQualifyingPart !== "undefined") {
      currentFastestLapTimeSeconds = 3600;
    }
    currentQualifyingPart = qualifyingPart;
  }
}

export function startLiveTimingDataPolling() {
  setInterval(async () => {
    const liveTimingData = await fetchMultiViewerLiveTimingData();
    if (!liveTimingData) return;
    liveTimingState = liveTimingData;

    checkForNewQualifyingPart();
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
