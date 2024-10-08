export type DateString = string;

export interface IRealtimeTimingState {
  ArchiveStatus: IArchiveStatus;
  AudioStreams: IStreams;
  CarData: ICarData;
  ChampionshipPrediction: IChampionshipPrediction | undefined;
  ContentStreams: IStreams;
  DriverList: IDriverList;
  ExtrapolatedClock: IExtrapolatedClock;
  Heartbeat: IHeartbeat;
  LapCount: ILapCount | undefined;
  LapTimeSeries: ILapTimeSeries | undefined;
  LapSeries: ILapSeries | undefined;
  PitLaneTimeCollection: IPitLaneTimeCollection | undefined;
  PitStopTimeCollection: IPitStopTimeCollection | undefined;
  SegmentGapTimeSeries: ISegmentGapTimeSeries | undefined;
  Position: IPosition;
  RaceControlMessages: IRaceControlMessages;
  SessionData: ISessionData;
  SessionInfo: ISessionInfo;
  SessionStatus: ISessionStatus;
  TeamRadio: ITeamRadio | undefined;
  TimingAppData: ITimingAppData;
  TimingData: ITimingData;
  TimingStats: ITimingStats;
  TopThree: ITopThree;
  TrackStatus: ITrackStatus;
  WeatherData: IWeatherData;
  WeatherDataSeries: IWeatherDataSeries;
}

export interface ISegmentGapTimeSeries {
  [lapNumberSectorSegmentId: string]: ISegmentGapTimeSeriesData;
}

export interface ISegmentGapTimeSeriesData {
  [driverNumber: string]: ISegmentGapTimeSeriesDataValue;
}

export interface ISegmentGapTimeSeriesDataValue {
  ts: number;
  GapToLeader: string;
  IntervalToPositionAhead: string;
  Position: string;
}

export interface ILapTimeSeries {
  [driverNumber: string]: ILapTimeSeriesData;
}

export interface ILapTimeSeriesData {
  [lapNumber: string]: ILapTimeSeriesDataValue;
}

export interface ILapTimeSeriesDataValue {
  InPit?: boolean;
  PitOut?: boolean;
  Value: string;
}

export interface ITeamRadio {
  Captures?: ITeamRadioCapture[];
}

export interface ITeamRadioCapture {
  Utc: DateString;
  RacingNumber: string;
  Path: string;
}

export interface IPitLaneTimeCollection {
  PitTimes: IPitTimes;
}

export interface IPitTimes {
  [driverNumber: string]: IPitTime;
}

export interface IPitTime {
  RacingNumber: string;
  Duration: string;
  Lap: string;
}

export interface IPitStopTimeCollection {
  PitStops: IPitStops;
}

export interface IPitStops {
  [driverNumber: string]: IPitStopTimeCollectionEntry;
}

export interface IPitStopTimeCollectionEntry {
  [pitStopNumber: string]: IPitStop;
}

export interface IPitStop {
  LapNumber: number;
  InPitTime: number;
  InPitPosition: string;
  PitOutTime: number;
  PitOutPosition: string;
}

export interface ILapSeries {
  [driverNumber: string]: ILapSeriesEntry;
}

export interface ILapSeriesEntry {
  RacingNumber: string;
  LapPosition: string[];
}

export interface IChampionshipPrediction {
  Drivers: { [driverNumber: string]: IChampionshipPredictionDriver };
  Teams: { [teamName: string]: IChampionshipPredictionTeam };
}

export interface IChampionshipPredictionDriver {
  RacingNumber: string;
  CurrentPosition: number;
  CurrentPoints: number;
  PredictedPosition: number;
  PredictedPoints: number;
}

export interface IChampionshipPredictionTeam {
  TeamName: string;
  CurrentPosition: number;
  CurrentPoints: number;
  PredictedPosition: number;
  PredictedPoints: number;
}

export interface ILapCount {
  TotalLaps: number;
  CurrentLap: number;
}

export interface ISessionStatus {
  Status:
    | "Inactive"
    | "Started"
    | "Finished"
    | "Finalised"
    | "Ends"
    | "Aborted";
}

export interface IArchiveStatus {
  Status: string;
}

export interface IStreams {
  Streams: IStream[];
}

export interface IStream {
  Name: string;
  Language: string;
  Uri: string;
  Path: string;
  Utc: DateString;
  Type?: string;
}

export interface ICarData {
  Entries: ICarDataEntry[];
}

export interface ICarDataEntry {
  Utc: DateString;
  Cars: { [key: string]: ICarDataEntryValue };
}

export interface ICarDataEntryValue {
  /**
   * Car telemetry channels:
   *
   * - 0: Engine RPM
   * - 2: Speed (km/h)
   * - 3: Gear (0 = neutral, 1-8 = forward gears, >9 = reverse gears)
   * - 4: Throttle (0-100%, 104 when unavailable?)
   * - 5: Brake (boolean 0-1, 104 when unavailable?)
   * - 45: DRS (0-14, odd is disabled, even is enabled)
   */
  Channels: { [key: string]: number };
}

export interface IDriverList {
  [driverNumber: string]: IDriver;
}

export interface IDriver {
  RacingNumber: string;
  BroadcastName: string;
  FullName: string;
  Tla: string;
  Line: number;
  TeamName: string;
  TeamColour: string;
  FirstName?: string;
  LastName?: string;
  Reference?: string;
  CountryCode: string;
  NameFormat?: "LastNameIsPrimary" | string;
}

export interface IExtrapolatedClock {
  Utc: DateString;
  Remaining: string;
  Extrapolating: boolean;
}

export interface IHeartbeat {
  Utc: DateString;
}

export interface IPosition {
  Position?: IPositionEntry[];
}

export interface IPositionEntry {
  Timestamp: DateString;
  Entries: { [key: string]: IPositionEntryValue };
}

export interface IPositionEntryValue {
  Status: PositionStatus;
  X: number;
  Y: number;
  Z: number;
}

export enum PositionStatus {
  OnTrack = "OnTrack",
}

export interface IRaceControlMessages {
  Messages: IRaceControlMessage[];
}

export enum RaceControlMessageSubCategory {
  Drs = "Drs",
  Flag = "Flag",
  SessionStartDelayed = "SessionStartDelayed",
  SessionDurationChanged = "SessionDurationChanged",
  LapTimeDeleted = "LapTimeDeleted",
  LapTimeReinstated = "LapTimeReinstated",
  LappedCarsMayOvertake = "LappedCarsMayOvertake",
  LappedCarsMayNotOvertake = "LappedCarsMayNotOvertake",
  NormalGripConditions = "NormalGripConditions",
  OffTrackAndContinued = "OffTrackAndContinued",
  SpunAndContinued = "SpunAndContinued",
  MissedApex = "MissedApex",
  CarStopped = "CarStopped",
  SafetyCar = "SafetyCar",
  MedicalCar = "MedicalCar",
  VirtualSafetyCar = "VirtualSafetyCar",
  IncidentNoted = "IncidentNoted",
  IncidentUnderInvestigation = "IncidentUnderInvestigation",
  IncidentInvestigationAfterSession = "IncidentInvestigationAfterSession",
  IncidentNoFurtherAction = "IncidentNoFurtherAction",
  IncidentNoFurtherInvestigation = "IncidentNoFurtherInvestigation",
  TimePenalty = "TimePenalty",
  StopGoPenalty = "StopGoPenalty",
  TrackTestCompleted = "TrackTestCompleted",
  TrackSurfaceSlippery = "TrackSurfaceSlippery",
  LowGripConditions = "LowGripConditions",
  Weather = "Weather",
  PitExit = "PitExit",
  PitEntry = "PitEntry",
  SessionResume = "SessionResume",
  Correction = "Correction",
  RecoveryVehicle = "RecoveryVehicle",
  SessionTemperatures = "SessionTemperatures",
  PaddingMaterial = "PaddingMaterial",
  AwningsAllowed = "AwningsAllowed",
  MandatoryTireCompound = "MandatoryTireCompound",
  RestartOrder = "RestartOrder",
  NoPracticeStarts = "NoPracticeStarts",
  SessionStartAborted = "SessionStartAborted",
  DriveThroughPenalty = "DriveThroughPenalty",
}

export interface IRaceControlMessage {
  Utc: DateString;
  Category: string;
  SubCategory: RaceControlMessageSubCategory;
  Flag:
    | "YELLOW"
    | "DOUBLE YELLOW"
    | "GREEN"
    | "CHECKERED"
    | "RED"
    | "BLUE"
    | "BLACK AND WHITE"
    | string;
  Status?:
    | "DEPLOYED"
    | "ENDING"
    | "DISABLED"
    | "ENABLED"
    | "IN THIS LAP"
    | "THROUGH THE PIT LANE";
  Scope: "Track" | "Sector" | "Driver";
  Mode?: "SAFETY CAR" | "VIRTUAL SAFETY CAR";
  Message: string;
  Lap?: number;
  Sector?: number;
}

export interface ISessionData {
  Series: ISessionSerie[] | undefined;
  StatusSeries: IStatusSerie[];
}

export interface ISessionSerie {
  Utc: DateString;
  QualifyingPart?: number;
}

export interface IStatusSerie {
  Utc: DateString;
  TrackStatus?:
    | "AllClear"
    | "VSCDeployed"
    | "VSCEnding"
    | "Yellow"
    | "Red"
    | "SCDeployed";
  SessionStatus?:
    | "Started"
    | "Finished"
    | "Finalised"
    | "Ends"
    | "Aborted"
    | "Inactive";
}

export interface IStreamingStatus {
  Status: "Offline" | "Available";
}

export interface ISessionInfo {
  Meeting: IMeeting;
  ArchiveStatus: IArchiveStatus;
  Key: number;
  Type: "Practice" | "Qualifying" | "Race";
  Number: number;
  Name: string;
  StartDate: DateString;
  EndDate: DateString;
  GmtOffset: string;
  Path: string;
}

export interface IArchiveStatus {
  Status: string;
}

export interface IMeeting {
  Key: number;
  Name: string;
  OfficialName: string;
  Location: string;
  Country: ICountry;
  Circuit: ICircuit;
}

export interface ICircuit {
  Key: number;
  ShortName: string;
}

export interface ICountry {
  Key: number;
  Code: string;
  Name: string;
}

export interface ITimingAppData {
  Lines: { [key: string]: ITimingAppDataLine };
}

export interface ITimingAppDataLine {
  GridPos?: string;
  RacingNumber: string;
  Line: number;
  Stints: IStint[];
}

export interface IStint {
  LapFlags: number;
  Compound:
    | "WET"
    | "INTERMEDIATE"
    | "HARD"
    | "MEDIUM"
    | "SOFT"

    // 2018 tires
    | "SUPERHARD"
    | "SUPERSOFT"
    | "ULTRASOFT"
    | "HYPERSOFT"
    | "UNKNOWN";
  New: "true" | "false";
  TyresNotChanged: string;
  TotalLaps: number;
  StartLaps: number;
  LapTime: string;
  LapNumber: number;
}

export interface ITimingData {
  SessionPart?: number;
  Lines: { [key: string]: ITimingDataLine };
  Withheld: boolean;
}

export interface ITimingDataLineStats {
  TimeDiffToFastest?: string;
  TimeDifftoPositionAhead?: string;
}

export interface ITimingDataLine {
  Stats?: ITimingDataLineStats[];
  TimeDiffToFastest?: string;
  TimeDiffToPositionAhead?: string;
  GapToLeader?: string;
  KnockedOut?: boolean;
  Cutoff?: boolean;
  BestLapTimes: IBestLapTime[];
  IntervalToPositionAhead?: IIntervalToPositionAhead;
  Line: number;
  Position: string;
  ShowPosition: boolean;
  RacingNumber: string;
  Retired: boolean;
  InPit: boolean;
  PitOut: boolean;
  Stopped: boolean;
  Status: number;
  Sectors: ISector[];
  Speeds: ISpeeds;
  BestLapTime: IBestLapTime;
  LastLapTime: ILastLapTime;
  NumberOfLaps?: number;
  NumberOfPitStops?: number;
}

export interface IBestLapTime {
  Value: string;
  Lap?: number;
}

export interface IIntervalToPositionAhead {
  Value: string;
  Catching: boolean;
}

export interface ILastLapTime {
  Value: string;
  Status: number;
  OverallFastest: boolean;
  PersonalFastest: boolean;
}

export interface ISpeed {
  Value: string;
  Status: number;
  OverallFastest: boolean;
  PersonalFastest: boolean;
}

export interface ISector {
  Stopped: boolean;
  Value: string;
  Status: number;
  OverallFastest: boolean;
  PersonalFastest: boolean;
  Segments: ISegment[];
  PreviousValue?: string;
}

export interface ISegment {
  Status: number;
}

export interface ISpeeds {
  I1: ISpeed;
  I2: ISpeed;
  FL: ISpeed;
  ST: ISpeed;
}

export interface ITimingStats {
  Withheld: boolean;
  Lines: { [key: string]: ITimingStatsLine };
  SessionType: string;
}

export interface ITimingStatsLine {
  Line: number;
  RacingNumber: string;
  PersonalBestLapTime: IBestLapTime;
  BestSectors: IBestSector[];
  BestSpeeds: IBestSpeeds;
}

export interface IBestSpeeds {
  I1: IBestSpeed;
  I2: IBestSpeed;
  FL: IBestSpeed;
  ST: IBestSpeed;
}

export interface IBestSector {
  Value: string;
  Position?: number;
}

export interface IBestSpeed {
  Value: string;
  Position?: number;
}

export interface ITopThree {
  Withheld: boolean;
  Lines: ITopThreeLine[];
}

export interface ITopThreeLine {
  Position: string;
  ShowPosition: boolean;
  RacingNumber: string;
  Tla: string;
  BroadcastName: string;
  FullName: string;
  Team: string;
  TeamColour: string;
  LapTime: string;
  LapState: number;
  DiffToAhead: string;
  DiffToLeader: string;
  OverallFastest: boolean;
  PersonalFastest: boolean;
}

// {"Status":"1","Message":"AllClear"}
// {"Status":"2","Message":"Yellow"}
// event 3 has never been seen, but potentially {"Status":"3","Message":"SCStandBy"}
// {"Status":"4","Message":"SCDeployed"}
// {"Status":"5","Message":"Red"}
// {"Status":"6","Message":"VSCDeployed"}
// {"Status":"7","Message":"VSCEnding"}
export interface ITrackStatus {
  Status: "1" | "2" | "4" | "5" | "6" | "7" | string;
  Message:
    | "AllClear"
    | "Yellow"
    | "SCDeployed"
    | "Red"
    | "VSCDeployed"
    | "VSCEnding"
    | string;
}

export interface IWeatherData {
  AirTemp: string;
  Humidity: string;
  Pressure: string;
  Rainfall: string;
  TrackTemp: string;
  WindDirection: string;
  WindSpeed: string;
}

export interface IWeatherDataSeries {
  Series: IWeatherDataSeriesEntry[];
}

export interface IWeatherDataSeriesEntry {
  Timestamp: DateString;
  Weather: IWeatherData;
}
