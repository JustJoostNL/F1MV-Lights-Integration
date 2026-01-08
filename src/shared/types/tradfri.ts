export interface IGetTradfriDevicesResponse {
  devices: {
    id: number;
    name: string;
    type: number;
    state: boolean;
    spectrum: number;
  }[];
  selectedDevices: number[];
}
