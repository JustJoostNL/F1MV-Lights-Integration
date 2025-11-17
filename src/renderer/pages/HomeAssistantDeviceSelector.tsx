import React from "react";
import { GridColDef } from "@mui/x-data-grid";
import {
  DeviceSelector,
  DeviceSelectorConfig,
} from "../components/shared/DeviceSelector";

interface IHomeAssistantDevice {
  entity_id: string;
  state: string;
  attributes: {
    friendly_name: string;
  };
}

const columns: GridColDef[] = [
  { field: "name", headerName: "Name", flex: 1, minWidth: 200 },
  { field: "id", headerName: "ID", flex: 1, minWidth: 200 },
  { field: "state", headerName: "State", width: 100 },
];

const selectorConfig: DeviceSelectorConfig<
  { id: string; name: string; state: string },
  IHomeAssistantDevice
> = {
  integrationName: "homeAssistant",
  swrKey: "homeAssistantDevices",
  fetchDevices: async () => {
    const data = await window.f1mvli.integrations.homeAssistant.getDevices();
    return { devices: data.devices, selectedDevices: data.selectedDevices };
  },
  transformDevice: (device) => ({
    id: device.entity_id,
    name: device.attributes.friendly_name,
    state: device.state,
  }),
  columns,
  configKey: "homeAssistantDevices",
};

export function HomeAssistantDeviceSelector() {
  return <DeviceSelector config={selectorConfig} />;
}
