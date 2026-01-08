export interface IHomeAssistantAPIPingResponse {
  message: string;
}

export interface IHomeAssistantStatesResponse {
  entity_id: string;
  state: string;
  attributes: StatesResponseAttributes;
  last_changed: Date;
  last_updated: Date;
  context: Context;
}

export interface StatesResponseAttributes {
  min_color_temp_kelvin?: number;
  max_color_temp_kelvin?: number;
  min_mireds?: number;
  max_mireds?: number;
  effect_list?: string[];
  supported_color_modes: SupportedColorMode[];
  color_mode: SupportedColorMode | null;
  brightness: number | null;
  color_temp_kelvin?: number | null;
  color_temp?: number | null;
  hs_color?: number[] | null;
  rgb_color?: number[] | null;
  xy_color?: number[] | null;
  effect?: null;
  mode?: string;
  dynamics?: boolean | string;
  friendly_name: string;
  supported_features: number;
  is_hue_group?: boolean;
  hue_scenes?: any[];
  hue_type?: string;
  lights?: string[];
  icon?: string;
  http_enabled?: boolean;
  ble_enabled?: boolean;
  lan_enabled?: boolean;
  update_status?: string;
  timeout_count?: number;
}

export interface Forecast {
  condition: string;
  precipitation_probability: number;
  datetime: Date;
  wind_bearing: number;
  cloud_coverage: number;
  temperature: number;
  pressure: number;
  wind_speed: number;
  precipitation: number;
  humidity: number;
}

export interface Repository {
  name: string;
  display_name: string;
  installed_version: string;
  available_version: string;
}

export enum SupportedColorMode {
  Brightness = "brightness",
  ColorTemp = "color_temp",
  Hs = "hs",
  Rgb = "rgb",
  Rgbw = "rgbw",
  Xy = "xy",
}

export interface Context {
  id: string;
  parent_id: null;
  user_id: null;
}

export interface IHomeAssistantStateResponse {
  entity_id: string;
  state: string;
  attributes: StateResponseAttributes;
  last_changed: Date;
  last_updated: Date;
  context: Context;
}

export interface StateResponseAttributes {
  supported_color_modes: SupportedColorMode[];
  color_mode: string;
  brightness: number;
  hs_color: number[];
  rgb_color: number[];
  xy_color: number[];
  friendly_name: string;
  supported_features: number;
}
