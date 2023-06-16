export interface ITimingStats {
  Withheld: boolean;
  Lines: { [key: string]: ITimingStatsLine };
  SessionType: string;
}
export interface ITimingStatsLinesObject {
  [key: string]: ITimingStatsLine;
}
export interface ITimingData {
  SessionPart?: number;
  Lines: { [key: string]: ITimingDataLine };
  Withheld: boolean;
}
export interface ITimingDataLinesObject {
  [key: string]: ITimingDataLine;
}


export interface IBestLapTime {
  Value: string;
  Lap?: number;
  Position?: number;
}
export interface IBestSector {
  Value: string;
  Position?: number;
}
export interface IBestSpeed {
  Value: string;
  Position?: number;
}
export interface IBestSpeeds {
  I1: IBestSpeed;
  I2: IBestSpeed;
  FL: IBestSpeed;
  ST: IBestSpeed;
}
export interface ITimingStatsLine {
  Line: number;
  RacingNumber: string;
  PersonalBestLapTime: IBestLapTime;
  BestSectors: IBestSector[];
  BestSpeeds: IBestSpeeds;
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
export interface IIntervalToPositionAhead {
  Value: string;
  Catching: boolean;
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
export interface ISpeed {
  Value: string;
  Status: number;
  OverallFastest: boolean;
  PersonalFastest: boolean;
}
export interface ISpeeds {
  I1: ISpeed;
  I2: ISpeed;
  FL: ISpeed;
  ST: ISpeed;
}
export interface ILastLapTime {
  Value: string;
  Status: number;
  OverallFastest: boolean;
  PersonalFastest: boolean;
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