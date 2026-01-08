export type HueDiscoveryResponse = IDiscoveredDevice[];
export type HueGenerateAuthTokenResponse = IHueGenerateAuthTokenResponse[];

export interface IHueGenerateAuthTokenResponse {
  error?: IGenerateAuthTokenError;
  success?: IGenerateAuthTokenSuccess;
}

interface IDiscoveredDevice {
  id: string;
  internalipaddress: string;
  port: number;
}

export interface IGenerateAuthTokenError {
  type: number;
  address: string;
  description: string;
}
interface IGenerateAuthTokenSuccess {
  username: string;
  clientkey: string;
}

export interface IHueClipLightResponse {
  errors: any[];
  data: Light[];
}

export interface IHueClipRoomResponse {
  errors: any[];
  data: Room[];
}

export interface IHueApiGroupResponse {
  [key: string]: ApiGroup;
}

export interface ApiGroup {
  name: string;
  lights: string[];
  sensors: any[];
  type: string;
  state: State;
  recycle: boolean;
  class: string;
  stream?: Stream;
  locations?: Locations;
  action: Action;
}

export interface Action {
  on: boolean;
  bri: number;
  hue: number;
  sat: number;
  effect: string;
  xy: number[];
  ct: number;
  alert: string;
  colormode: string;
}

export interface Locations {
  [key: string]: number[];
}

export interface State {
  all_on: boolean;
  any_on: boolean;
}

export interface Stream {
  proxymode: string;
  proxynode: string;
  active: boolean;
  owner: null;
}

export interface Light {
  id: string;
  id_v1: string;
  owner: Owner;
  metadata: Metadata;
  product_data: ProductData;
  identify: ColorTemperatureDelta;
  on: DatumOn;
  dimming: Dimming;
  dimming_delta: ColorTemperatureDelta;
  color_temperature: ColorTemperature;
  color_temperature_delta: ColorTemperatureDelta;
  color: DatumColor;
  dynamics: Dynamics;
  alert: Alert;
  signaling: Signaling;
  mode: string;
  effects: Effects;
  powerup: Powerup;
  type: string;
}

export interface Alert {
  action_values: string[];
}

export interface DatumColor {
  xy: Xy;
  gamut: Gamut;
  gamut_type: string;
}

export interface Gamut {
  red: Xy;
  green: Xy;
  blue: Xy;
}

export interface Xy {
  x: number;
  y: number;
}

export interface ColorTemperature {
  mirek: null;
  mirek_valid: boolean;
  mirek_schema: MirekSchema;
}

export interface MirekSchema {
  mirek_minimum: number;
  mirek_maximum: number;
}

export interface ColorTemperatureDelta {}

export interface Dimming {
  brightness: number;
  min_dim_level: number;
}

export interface Dynamics {
  status: string;
  status_values: string[];
  speed: number;
  speed_valid: boolean;
}

export interface Effects {
  status_values: string[];
  status: string;
  effect_values: string[];
}

export interface DatumOn {
  on: boolean;
}

export interface Owner {
  rid: string;
  rtype: string;
}

export interface Powerup {
  preset: string;
  configured: boolean;
  on: PowerupOn;
  dimming: DimmingClass;
  color: DimmingClass;
}

export interface DimmingClass {
  mode: string;
}

export interface PowerupOn {
  mode: string;
  on: DatumOn;
}

export interface ProductData {
  function: string;
}

export interface Signaling {
  signal_values: string[];
}

export interface Device {
  id: string;
  product_data: ProductData;
  metadata: Metadata;
  identify: Identify;
  services: Service[];
  type: string;
  id_v1?: string;
}

export interface Identify {}

export interface ProductData {
  model_id: string;
  manufacturer_name: string;
  product_name: string;
  product_archetype: string;
  certified: boolean;
  software_version: string;
  hardware_platform_type?: string;
}

export interface Service {
  rid: string;
  rtype: string;
}

export interface Room {
  id: string;
  id_v1: string;
  children: Child[];
  services: Child[];
  metadata: Metadata;
  type: string;
}

export interface Child {
  rid: string;
  rtype: string;
}

export interface Metadata {
  name: string;
  archetype?: string;
  function?: string;
}

export enum DiscoveryStatus {
  SUCCESS = "success",
  ERROR = "error",
  NO_BRIDGE_FOUND = "no_bridge_found",
  RATE_LIMIT = "rate_limit",
}

export interface DiscoverPhilipsHueBridgeResponse {
  status: DiscoveryStatus;
  ipAddresses: string[];
}

interface Resource {
  id: string;
  name: string;
  state: boolean;
}

export interface GetPhilipsHueGroupsResponse {
  groups: Resource[];
  selectedGroups: string[];
}

export interface GetPhilipsHueDevicesResponse {
  devices: Resource[];
  selectedDevices: string[];
}

export enum GenerationStatus {
  SUCCESS = "success",
  LINK_BUTTON_NOT_PRESSED = "link_button_not_pressed",
  ERROR = "error",
}
export interface GeneratePhilipsHueBridgeAuthTokenResponse {
  status: GenerationStatus;
  username?: string;
}
