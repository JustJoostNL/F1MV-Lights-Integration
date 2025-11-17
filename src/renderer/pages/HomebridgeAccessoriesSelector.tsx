import React from "react";
import { GridColDef } from "@mui/x-data-grid";
import {
  DeviceSelector,
  DeviceSelectorConfig,
} from "../components/shared/DeviceSelector";
import { IHomebridgeAccessory } from "../../shared/integrations/homebridge_types";

const columns: GridColDef[] = [
  { field: "name", headerName: "Name", flex: 1, minWidth: 200 },
  { field: "id", headerName: "ID", flex: 1, minWidth: 200 },
  { field: "state", headerName: "State", width: 100 },
];

const selectorConfig: DeviceSelectorConfig<
  { id: string; name: string; state: string },
  IHomebridgeAccessory
> = {
  integrationName: "homebridge",
  swrKey: "homebridgeAccessories",
  fetchDevices: async () => {
    const data = await window.f1mvli.integrations.homebridge.getAccessories();
    return {
      devices: data.accessories,
      selectedDevices: data.selectedAccessories,
    };
  },
  transformDevice: (accessory) => ({
    id: accessory.uniqueId,
    name: accessory.accessoryInformation.Name,
    state: accessory.values.On ? "On" : "Off",
  }),
  columns,
  configKey: "homebridgeAccessories",
};

export function HomebridgeAccessoriesSelector() {
  return <DeviceSelector config={selectorConfig} />;
}
