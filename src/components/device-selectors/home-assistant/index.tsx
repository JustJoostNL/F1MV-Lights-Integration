import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridSelectionModel } from "@mui/x-data-grid";
import LoadingScreen from "@/pages/LoadingScreen";
import { Checkbox, Switch } from "@mui/material";
import log from "electron-log/renderer";

export function HomeAssistantDeviceSelector() {
  const [hassData, setHassData] = useState<any | null>(null);
  const [selectionModel, setSelectionModel] = useState<any[]>([]);

  // fetch the initial data when the component mounts
  useEffect(() => {
    async function fetchHassData() {
      const fetchedData = await window.f1mvli.integrations.homeAssistant.getDevices();
      setHassData(fetchedData);
      setSelectionModel(fetchedData.alreadySelectedDevices);
    }
    fetchHassData();
  }, []);

  // refresh the state every 2 seconds
  useEffect(() => {
    const intervalId = setInterval(async () => {
      const fetchedData = await window.f1mvli.integrations.homeAssistant.getDevices();
      setHassData((hassData: any) => {
        if (hassData) {
          const existingRows = hassData.devices;
          const newRows = fetchedData.devices.map((device: any) => {
            const existingRow = existingRows.find((row: any) => row.id === device.id);
            if (existingRow) {
              return {
                ...existingRow,
                state: device.state
              };
            }
            return device;
          });
          return {
            devices: newRows,
            alreadySelectedDevices: hassData.alreadySelectedDevices
          };
        }
        return null;
      });
    }, 2000);
    return () => clearInterval(intervalId);
  }, []);

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", width: 200 },
    { field: "id", headerName: "ID", width: 200 },
    { field: "state", headerName: "State", width: 100 },
  ];

  if (!hassData) {
    return (
      <LoadingScreen/>
    );
  }

  const rows = hassData.devices.map((device: any) => {
    return {
      id: device.id,
      name: device.name,
      state: device.state
    };
  });

  const handleSelectionModelChange = (newSelection: GridSelectionModel) => {
    setSelectionModel(newSelection);
    const selectedDevices = rows.filter((row: any) => newSelection.includes(row.id));
    const selectedDeviceIds = selectedDevices.map((device: any) => device.id);
    window.f1mvli.config.set("Settings.homeAssistantSettings.devices", selectedDeviceIds);
  };

  return (
    <div style={{ height: 550, width: "80%", alignItems: "center", alignContent: "center", marginLeft: 70 }}>
      <DataGrid
        rows={rows}
        components={{
          BaseCheckbox: React.forwardRef((props, ref) => (
            <Checkbox color="secondary" ref={ref} {...props} />
          )),
          BaseSwitch: React.forwardRef((props, ref) => (
            <Switch color="secondary" ref={ref} {...props} />
          ))
        }}
        sx={{ color: "white" }}
        columns={columns}
        pageSize={8}
        rowsPerPageOptions={[8]}
        disableColumnFilter
        disableColumnSelector
        disableColumnMenu
        checkboxSelection
        disableSelectionOnClick
        selectionModel={selectionModel}
        onSelectionModelChange={handleSelectionModelChange}
      />
    </div>
  );
}