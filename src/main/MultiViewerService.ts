import log from "electron-log";
import fetch from "cross-fetch";
import { debounce, isEqual } from "lodash";
import {
  EventType,
  eventTypeReadableMap,
  DriverAudioEventType,
} from "../shared/types/config";
import {
  IRaceControlMessages,
  ISessionData,
  ISessionInfo,
  ISessionStatus,
  ITimingData,
  ITimingStats,
  ITrackStatus,
} from "../shared/types/multiviewer";
import { MiscState } from "../shared/types/integration";
import { getConfig, globalConfig } from "./ipc/config";
import { integrationManager } from "./integrations/IntegrationManager";
import { getAssetsPath } from "./utils/getAssetsPath";
import { mainWindow } from ".";

export const statusEventMap: Record<string, EventType> = {
  "1": EventType.GreenFlag,
  "2": EventType.YellowFlag,
  "4": EventType.SafetyCar,
  "5": EventType.RedFlag,
  "6": EventType.VirtualSafetyCar,
  "7": EventType.VirtualSafetyCarEnding,
};

const messagePatterns: [RegExp, EventType][] = [
  [/CHEQUERED FLAG/i, EventType.ChequeredFlag],
  [/BLUE FLAG/i, EventType.BlueFlag],
  [/DRS ENABLED/i, EventType.DrsEnabled],
  [/DRS DISABLED/i, EventType.DrsDisabled],
  [/PIT LANE ENTRY CLOSED/i, EventType.PitLaneEntryClosed],
  [/PIT EXIT OPEN/i, EventType.PitExitOpen],
  [/PIT ENTRY CLOSED/i, EventType.PitEntryClosed],
];

const subcategoryToEvent = new Map<string, EventType>([
  ["TimePenalty", EventType.TimePenalty],
  ["SessionStartDelayed", EventType.SessionStartDelayed],
  ["SessionDurationChanged", EventType.SessionDurationChanged],
  ["LapTimeDeleted", EventType.LapTimeDeleted],
  ["LapTimeReinstated", EventType.LapTimeReinstated],
  ["LappedCarsMayOvertake", EventType.LappedCarsMayOvertake],
  ["LappedCarsMayNotOvertake", EventType.LappedCarsMayNotOvertake],
  ["NormalGripConditions", EventType.NormalGripConditions],
  ["OffTrackAndContinued", EventType.OffTrackAndContinued],
  ["SpunAndContinued", EventType.SpunAndContinued],
  ["MissedApex", EventType.MissedApex],
  ["CarStopped", EventType.CarStopped],
  ["MedicalCar", EventType.MedicalCar],
  ["IncidentNoted", EventType.IncidentNoted],
  ["IncidentUnderInvestigation", EventType.IncidentUnderInvestigation],
  [
    "IncidentInvestigationAfterSession",
    EventType.IncidentInvestigationAfterSession,
  ],
  ["IncidentNoFurtherAction", EventType.IncidentNoFurtherAction],
  ["IncidentNoFurtherInvestigation", EventType.IncidentNoFurtherInvestigation],
  ["StopGoPenalty", EventType.StopGoPenalty],
  ["TrackSurfaceSlippery", EventType.TrackSurfaceSlippery],
  ["LowGripConditions", EventType.LowGripConditions],
  ["SessionStartAborted", EventType.SessionStartAborted],
  ["DriveThroughPenalty", EventType.DriveThroughPenalty],
]);

export interface ILiveTimingData {
  RaceControlMessages: IRaceControlMessages | undefined;
  SessionData: ISessionData;
  SessionInfo: ISessionInfo;
  SessionStatus: ISessionStatus;
  TimingData: ITimingData;
  TimingStats: ITimingStats;
  TrackStatus: ITrackStatus;
}

export type EventCallback = (event: EventType) => void;

class MultiViewerService {
  private static instance: MultiViewerService;

  private _isOnline: boolean = false;
  private _liveTimingState: ILiveTimingData | undefined = undefined;
  private _currentFastestLapTimeSeconds: number | undefined = undefined;
  private _currentQualifyingPart: number | undefined = undefined;
  private _previousTrackStatus: ITrackStatus | undefined = undefined;
  private _previousSessionStatus: ISessionStatus | undefined = undefined;
  private _processedRaceControlMessages: IRaceControlMessages = {
    Messages: [],
  };
  private _errorCheck: boolean = false;
  private _previousDriverPositions: Map<string, string> = new Map();

  private _pollingInterval: ReturnType<typeof setInterval> | null = null;
  private _eventCallback: EventCallback | null = null;

  private constructor() {}

  static getInstance(): MultiViewerService {
    if (!MultiViewerService.instance) {
      MultiViewerService.instance = new MultiViewerService();
    }
    return MultiViewerService.instance;
  }

  /**
   * Set the callback for when events are detected
   */
  setEventCallback(callback: EventCallback): void {
    this._eventCallback = callback;
  }

  /**
   * Get the current live timing state
   */
  getLiveTimingState(): ILiveTimingData | undefined {
    return this._liveTimingState;
  }

  /**
   * Check if the MultiViewer API is online
   */
  isOnline(): boolean {
    return this._isOnline;
  }

  /**
   * Start the live timing data polling
   */
  startPolling(): void {
    if (!globalConfig.multiviewerCheck) return;
    if (this._pollingInterval) return;

    log.info("Starting MultiViewer live timing polling...");

    this._pollingInterval = setInterval(async () => {
      const liveTimingData = await this.fetchLiveTimingData();
      if (!liveTimingData) return;

      this._liveTimingState = liveTimingData;

      this.checkForNewQualifyingPart();
      this.checkForNewFastestLap(
        liveTimingData.TimingStats.Lines,
        liveTimingData.TimingData.Lines,
      );
      this.checkForTrackStatusChange(
        liveTimingData.TrackStatus,
        this._previousTrackStatus,
        liveTimingData.SessionStatus,
        this._previousSessionStatus,
      );
      this.checkForNewEventsInRaceControlMessages(
        liveTimingData.RaceControlMessages,
      );
      this.checkForDriverPositionChanges(liveTimingData.TimingData.Lines);
    }, 500);
  }

  /**
   * Stop polling
   */
  stopPolling(): void {
    if (this._pollingInterval) {
      clearInterval(this._pollingInterval);
      this._pollingInterval = null;
      log.info("Stopped MultiViewer polling");
    }
  }

  /**
   * Check if the MultiViewer API is reachable
   */
  async checkApiStatus(): Promise<boolean> {
    const config = await getConfig();
    const heartbeatUrl = new URL(
      "/api/v1/live-timing/Heartbeat",
      config.multiviewerLiveTimingURL,
    );

    try {
      const response = await fetch(heartbeatUrl.toString(), { method: "GET" });
      const json = await response.json();

      const isOnline =
        json.error !== "No data found, do you have live timing running?";
      this._isOnline = isOnline;
      integrationManager.setMiscState(MiscState.MULTIVIEWER, isOnline);

      if (isOnline) {
        log.debug("MultiViewer API is online.");
      } else {
        log.debug("MultiViewer API is offline.");
      }

      return isOnline;
    } catch (error) {
      this._isOnline = false;
      integrationManager.setMiscState(MiscState.MULTIVIEWER, false);
      return false;
    }
  }

  /**
   * Fetch live timing data from the MultiViewer GraphQL API
   */
  private async fetchLiveTimingData(): Promise<ILiveTimingData | undefined> {
    try {
      const config = await getConfig();
      const graphqlUrl = new URL(
        "/api/graphql",
        config.multiviewerLiveTimingURL,
      );

      const response = await fetch(graphqlUrl.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: /* GraphQL */ `
            query QueryAllLiveTimingData {
              f1LiveTimingState {
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

      if (!response.ok) {
        if (!this._errorCheck) {
          this._errorCheck = true;
          log.warn(
            "MultiViewer GraphQL API call failed! Error: " +
              response.statusText,
          );
        }
        return undefined;
      }

      const json = await response.json();

      this._errorCheck = false;
      return json.data.f1LiveTimingState;
    } catch (error: unknown) {
      if (!this._errorCheck) {
        this._errorCheck = true;
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        log.warn("MultiViewer GraphQL API call failed! Error: " + errorMessage);
      }
      return undefined;
    }
  }

  /**
   * Parse a lap time string to seconds
   */
  parseLapTime(lapTime: string): number {
    const [minutes, seconds, milliseconds] = lapTime
      .split(/[:.]/)
      .map((number) => parseInt(number.replace(/^0+/, "") || "0", 10));

    if (milliseconds === undefined) {
      return minutes + seconds / 1000;
    }

    return minutes * 60 + seconds + milliseconds / 1000;
  }

  private async checkForNewFastestLap(
    _TimingStats: ITimingStats["Lines"],
    TimingData: ITimingData["Lines"],
  ): Promise<void> {
    let fastestLapTimeSeconds: number | undefined = undefined;
    let fastestDriverNumber: string | undefined = undefined;

    for (const [driverNumber, line] of Object.entries(TimingData ?? {})) {
      if (line.KnockedOut === true) continue;
      if (line.Retired === true) continue;
      if (line.Stopped === true) continue;

      const lapTime = line.BestLapTime?.Value;
      if (!lapTime) continue;

      const parsed = this.parseLapTime(lapTime);
      if (
        fastestLapTimeSeconds === undefined ||
        parsed < fastestLapTimeSeconds
      ) {
        fastestLapTimeSeconds = parsed;
        fastestDriverNumber = driverNumber;
      }
    }

    if (fastestLapTimeSeconds === undefined) return;

    if (
      typeof this._currentFastestLapTimeSeconds === "number" &&
      fastestLapTimeSeconds >= this._currentFastestLapTimeSeconds
    ) {
      return;
    }

    if (typeof this._currentFastestLapTimeSeconds === "number") {
      this._currentFastestLapTimeSeconds = fastestLapTimeSeconds;
      this.emitEvent(EventType.FastestLap);

      if (fastestDriverNumber) {
        await this.playDriverAudioForFastestLap(fastestDriverNumber);
      }
    } else {
      this._currentFastestLapTimeSeconds = fastestLapTimeSeconds;
    }
  }

  private checkForTrackStatusChange(
    TrackStatus: ITrackStatus,
    previousTrackStatus: ITrackStatus | undefined,
    SessionStatus: ISessionStatus,
    previousSessionStatus: ISessionStatus | undefined,
  ): void {
    if (
      previousTrackStatus?.Status !== TrackStatus.Status &&
      SessionStatus.Status !== "Ends" &&
      SessionStatus.Status !== "Finalised"
    ) {
      const eventType = statusEventMap[TrackStatus.Status];
      if (eventType) this.emitEvent(eventType);
    } else if (
      (SessionStatus.Status === "Ends" ||
        SessionStatus.Status === "Finalised") &&
      previousSessionStatus?.Status !== SessionStatus.Status
    ) {
      this.emitEvent(EventType.SessionEnded);
    }
  }

  private checkForNewEventsInRaceControlMessages(
    messages: IRaceControlMessages | undefined,
  ): void {
    if (!messages || !messages.Messages) return;

    if (
      this._processedRaceControlMessages.Messages.length === 0 &&
      messages.Messages.length > 0
    ) {
      this._processedRaceControlMessages = messages;
      return;
    }

    if (
      messages.Messages.length ===
      this._processedRaceControlMessages.Messages.length
    ) {
      return;
    }

    const newMessages = messages.Messages.filter(
      (message) =>
        !this._processedRaceControlMessages.Messages.find((m) =>
          isEqual(m, message),
        ),
    );

    if (!newMessages.length) return;

    const lastMessage = newMessages[newMessages.length - 1];

    // Process message text patterns
    for (const [pattern, eventType] of messagePatterns) {
      if (lastMessage.Message.match(pattern)) {
        this.emitEvent(eventType);
      }
    }

    // Process subcategory events using a Map for better type safety
    const eventType = subcategoryToEvent.get(lastMessage.SubCategory);
    if (eventType) {
      this.emitEvent(eventType);
    }

    this._processedRaceControlMessages = messages;
  }

  private checkForNewQualifyingPart(): void {
    if (this._liveTimingState?.SessionInfo.Type !== "Qualifying") return;

    const qualifyingPart = this._liveTimingState?.SessionData.Series
      ? this._liveTimingState?.SessionData.Series[
          this._liveTimingState?.SessionData.Series.length - 1
        ]?.QualifyingPart
      : null;

    if (qualifyingPart === null) return;

    if (this._currentQualifyingPart !== qualifyingPart) {
      if (typeof this._currentQualifyingPart !== "undefined") {
        this._currentFastestLapTimeSeconds = 3600;
      }
      this._currentQualifyingPart = qualifyingPart;
    }
  }

  private async checkForDriverPositionChanges(
    timingData: ITimingData["Lines"],
  ): Promise<void> {
    if (!timingData) return;

    const config = await getConfig();
    const driverAudioAlerts = config.driverAudioAlerts?.filter(
      (alert) =>
        alert.enabled &&
        alert.events.includes(DriverAudioEventType.POSITION_GAIN),
    );

    if (!driverAudioAlerts || driverAudioAlerts.length === 0) return;

    for (const [driverNumber, line] of Object.entries(timingData)) {
      const currentPosition = line.Position;
      const previousPosition = this._previousDriverPositions.get(driverNumber);

      // Skip if no previous position (first run) or driver is not on track
      if (!previousPosition || !currentPosition) {
        this._previousDriverPositions.set(driverNumber, currentPosition);
        continue;
      }

      // Check if position improved (lower number = better position)
      const prevPos = parseInt(previousPosition, 10);
      const currPos = parseInt(currentPosition, 10);

      if (!isNaN(prevPos) && !isNaN(currPos) && currPos < prevPos) {
        const matchingAlert = driverAudioAlerts.find(
          (alert) => alert.driverNumber === driverNumber,
        );

        if (matchingAlert) {
          log.debug(
            `Position gain for driver ${driverNumber}: ${previousPosition} -> ${currentPosition}`,
          );
          await this.debouncedPlayDriverAudio(matchingAlert.filePath);
        }
      }

      this._previousDriverPositions.set(driverNumber, currentPosition);
    }
  }

  private async playDriverAudioForFastestLap(
    driverNumber: string,
  ): Promise<void> {
    const config = await getConfig();
    const driverAudioAlerts = config.driverAudioAlerts?.filter(
      (alert) =>
        alert.enabled &&
        alert.events.includes(DriverAudioEventType.FASTEST_LAP) &&
        alert.driverNumber === driverNumber,
    );

    if (driverAudioAlerts && driverAudioAlerts.length > 0) {
      const alert = driverAudioAlerts[0];
      log.debug(`Driver ${driverNumber} set the fastest lap`);
      await this.debouncedPlayDriverAudio(alert.filePath);
    }
  }

  private debouncedPlayDriverAudio = debounce(
    async (filePath?: string) => {
      await this.playDriverAudio(filePath);
    },
    1000,
    { leading: true, trailing: false },
  );

  private async playDriverAudio(filePath?: string): Promise<void> {
    try {
      if (mainWindow && !mainWindow.isDestroyed()) {
        const audioPath = filePath || getAssetsPath("team_radio_f1fx.wav");

        mainWindow.webContents.send("f1mvli:utils:play-audio", {
          filePath: audioPath,
          volume: 1.0,
        });
      }
    } catch (error) {
      log.error("Error playing driver audio:", error);
    }
  }

  private emitEvent(event: EventType): void {
    if (this._eventCallback) {
      this._eventCallback(event);
    }
    log.info("New event: ", eventTypeReadableMap[event]);
    this._previousTrackStatus = this._liveTimingState?.TrackStatus;
    this._previousSessionStatus = this._liveTimingState?.SessionStatus;
  }

  /**
   * Reset internal state
   */
  reset(): void {
    this._liveTimingState = undefined;
    this._currentFastestLapTimeSeconds = undefined;
    this._currentQualifyingPart = undefined;
    this._previousTrackStatus = undefined;
    this._previousSessionStatus = undefined;
    this._processedRaceControlMessages = { Messages: [] };
    this._errorCheck = false;
    this._isOnline = false;
    this._previousDriverPositions.clear();
  }
}

export const multiViewerService = MultiViewerService.getInstance();
