import React from "react";
import { GridColDef } from "@mui/x-data-grid";
import {
  DeviceSelector,
  DeviceSelectorConfig,
} from "../components/shared/DeviceSelector";

interface PhilipsHueDevice {
  id: string;
  name: string;
  state: boolean;
}

const columns: GridColDef[] = [
  { field: "name", headerName: "Name", flex: 1, minWidth: 200 },
  { field: "id", headerName: "ID", flex: 1, minWidth: 250 },
  { field: "state", headerName: "State", width: 100 },
];

const selectorConfig: DeviceSelectorConfig<
  { id: string; name: string; state: string },
  PhilipsHueDevice
> = {
  integrationName: "philipsHue",
  swrKey: "philipsHueDevices",
  fetchDevices: async () => {
    const data = await window.f1mvli.integrations.philipsHue.getDevices();
    return { devices: data.devices, selectedDevices: data.selectedDevices };
  },
  transformDevice: (device) => ({
    id: device.id,
    name: device.name,
    state: device.state ? "On" : "Off",
  }),
  columns,
  configKey: "philipsHueDeviceIds",
};

export function PhilipsHueDeviceSelector() {
  return <DeviceSelector config={selectorConfig} />;
}
