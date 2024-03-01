export interface IVersions {
  BLEhardware: string;
  BLEsoftware: string;
  WiFiHardware: string;
  WiFiSoftware: string;
}

export interface IState {
  isOn: 0 | 1;
  brightness: number;
  color: {
    r: number;
    g: number;
    b: number;
  };
  colorKelvin: number;
}

export type ColorOptions = {
  HEX: string;
  RGB: [number, number, number];
  HSL: [number, number, number];
  Kelvin: number;
};

export interface IActions {
  setColor: (color: ColorOptions) => void;
  setBrightness: (brightness: number) => void;
  fadeColor: (time: number, color?: ColorOptions, brightness?: number) => void;
  setOff: () => void;
  setOn: () => void;
}
