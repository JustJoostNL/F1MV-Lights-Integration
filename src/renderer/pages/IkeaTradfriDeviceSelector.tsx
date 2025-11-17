import React from "react";
import { GridColDef } from "@mui/x-data-grid";
import {
  DeviceSelector,
  DeviceSelectorConfig,
} from "../components/shared/DeviceSelector";
import { IGetTradfriDevicesResponse } from "../../shared/integrations/tradfri_types";

type IkeaTradfriDevice = IGetTradfriDevicesResponse["devices"][number];

const columns: GridColDef[] = [
  { field: "name", headerName: "Name", flex: 1, minWidth: 200 },
  { field: "id", headerName: "ID", flex: 1, minWidth: 250 },
  { field: "state", headerName: "State", width: 100 },
  { field: "spectrum", headerName: "Spectrum", width: 200 },
];

const selectorConfig: DeviceSelectorConfig<
  { id: string; name: string; state: string; spectrum: string },
  IkeaTradfriDevice
> = {
  integrationName: "tradfri",
  swrKey: "ikeaTradfriDevices",
  fetchDevices: async () => {
    const data = await window.f1mvli.integrations.tradfri.getDevices();
    return {
      devices: data?.devices || [],
      selectedDevices: (data?.selectedDevices || []).map(String),
    };
  },
  transformDevice: (device) => ({
    id: String(device.id),
    name: device.name,
    state: device.state ? "On" : "Off",
    spectrum: String(device.spectrum),
  }),
  columns,
  configKey: "ikeaDeviceIds",
};

export function IkeaTradfriDeviceSelector() {
  return <DeviceSelector config={selectorConfig} />;
}
