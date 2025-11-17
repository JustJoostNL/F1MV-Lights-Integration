import React from "react";
import { GridColDef } from "@mui/x-data-grid";
import {
  DeviceSelector,
  DeviceSelectorConfig,
} from "../components/shared/DeviceSelector";

interface PhilipsHueGroup {
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
  PhilipsHueGroup
> = {
  integrationName: "philipsHue",
  swrKey: "philipsHueGroups",
  fetchDevices: async () => {
    const data = await window.f1mvli.integrations.philipsHue.getGroups();
    return { devices: data.groups, selectedDevices: data.selectedGroups };
  },
  transformDevice: (group) => ({
    id: group.id,
    name: group.name,
    state: group.state ? "On" : "Off",
  }),
  columns,
  configKey: "philipsHueGroupIds",
};

export function PhilipsHueGroupSelector() {
  return <DeviceSelector config={selectorConfig} />;
}
