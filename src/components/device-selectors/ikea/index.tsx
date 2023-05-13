import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridSelectionModel } from "@mui/x-data-grid";
import LoadingScreen from "@/pages/LoadingScreen";
import { Checkbox, Switch } from "@mui/material";

export default function IKEADeviceSelector() {
  const [ikeaData, setIkeaData] = useState<any | null>(null);
  const [selectionModel, setSelectionModel] = useState<any[]>([]);

  // fetch the initial data when the component mounts
  useEffect(() => {
    async function fetchIkeaData() {
      const fetchedData = await window.f1mvli.integrations.ikea.getDevices();
      setIkeaData(fetchedData);
      setSelectionModel(fetchedData.alreadySelectedDevices);
    }
    fetchIkeaData();
  }, []);

  // refresh the state every 2 seconds
  useEffect(() => {
    const intervalId = setInterval(async () => {
      const fetchedData = await window.f1mvli.integrations.ikea.getDevices();
      setIkeaData((ikeaData: any) => {
        if (ikeaData) {
          const existingRows = ikeaData.devices;
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
            alreadySelectedDevices: ikeaData.alreadySelectedDevices
          };
        }
        return null;
      });
    }, 2000);
    return () => clearInterval(intervalId);
  }, []);

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", width: 200 },
    { field: "id", headerName: "ID", width: 100 },
    { field: "state", headerName: "State", width: 100 },
    { field: "spectrum", headerName: "Spectrum", width: 100 },
  ];

  if (!ikeaData) {
    return (
      <LoadingScreen/>
    );
  }

  const rows = ikeaData.devices.map((device: any) => {
    return {
      id: device.id,
      name: device.name,
      state: device.state,
      spectrum: device.spectrum
    };
  });

  const handleSelectionModelChange = (newSelection: GridSelectionModel) => {
    setSelectionModel(newSelection);
    const selectedDevices = rows.filter((row: any) => newSelection.includes(row.id));
    const selectedDeviceIds = selectedDevices.map((device: any) => device.id);
    window.f1mvli.config.set("Settings.ikeaSettings.deviceIDs", selectedDeviceIds);
  };

  return (
    <div style={{ height: 528, width: "120%", marginLeft: -43 }}>
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