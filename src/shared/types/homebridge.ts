export interface IHomebridgeAuthCheckResponse {
  status: "OK" | "Unauthorized" | string;
  statusCode: number;
}

export interface IHomebridgeTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export type IHomebridgeAccessoryResponse = IHomebridgeAccessory[];

export interface IHomebridgeAccessory {
  aid: number;
  iid: number;
  uuid: string;
  type: string;
  humanType: string;
  serviceName: string;
  serviceCharacteristics: ServiceCharacteristic[];
  accessoryInformation: AccessoryInformation;
  values: Values;
  instance: Instance;
  uniqueId: string;
}

export interface AccessoryInformation {
  Manufacturer: string;
  Model: string;
  Name: string;
  "Serial Number": string;
  "Firmware Revision": string;
  "Configured Name"?: string;
}

export interface ServiceCharacteristic {
  aid: number;
  iid: number;
  uuid: string;
  type: string;
  serviceType: string;
  serviceName: string;
  description: string;
  value: string | number;
  format: string;
  perms: Perm[];
  canRead: boolean;
  canWrite: boolean;
  ev: boolean;
  unit?: string;
  maxValue?: number;
  minValue?: number;
  minStep?: number;
}

export enum Perm {
  PAIRED_READ = "pr",
  PAIRED_WRITE = "pw",
  NOTIFY = "ev",
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  EVENTS = "ev",
  ADDITIONAL_AUTHORIZATION = "aa",
  TIMED_WRITE = "tw",
  HIDDEN = "hd",
  WRITE_RESPONSE = "wr",
}

export interface Values {
  Version?: string;
  On?: number;
  Brightness?: number;
  Hue?: number;
  Saturation?: number;
  ColorTemperature?: number;
  CharacteristicValueActiveTransitionCount?: number;
  SupportedCharacteristicValueTransitionConfiguration?: string;
  CharacteristicValueTransitionControl?: string;
}

export interface Instance {
  name: string;
  username: string;
  ipAddress: string;
  port: number;
  services: unknown[];
  connectionFailedCount: number;
}
