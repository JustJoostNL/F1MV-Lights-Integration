import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridSelectionModel } from "@mui/x-data-grid";
import LoadingScreen from "@/pages/LoadingScreen";
import { Checkbox, Switch } from "@mui/material";

export default function HueEntertainmentZoneSelector(){
  const [hueData, setHueData] = useState<any | null>(null);
  const [selectionModel, setSelectionModel] = useState<any[]>([]);

  // fetch the initial data when the component mounts
  useEffect(() => {
    async function fetchHueData() {
      const fetchedData = await window.f1mvli.integrations.hue.getEntertainmentZones();
      setHueData(fetchedData);
      setSelectionModel(fetchedData.alreadySelectedZones);
    }
    fetchHueData();
  }, []);

  // refresh the state every 2 seconds
  useEffect(() => {
    const intervalId = setInterval(async () => {
      const fetchedData = await window.f1mvli.integrations.hue.getEntertainmentZones();
      setHueData((hueData: any) => {
        if (hueData) {
          const existingRows = hueData.zones;
          const newRows = fetchedData.zones.map((zone: any) => {
            const existingRow = existingRows.find((row: any) => row.id === zone.id);
            if (existingRow) {
              return {
                ...existingRow,
                state: zone.state
              };
            }
            return zone;
          });
          return {
            zones: newRows,
            alreadySelectedZones: hueData.alreadySelectedZones
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
  ];

  if (!hueData) {
    return (
      <LoadingScreen/>
    );
  }

  const rows = hueData.zones.map((zone: any) => {
    return {
      id: zone.id,
      name: zone.name,
      state: zone.state
    };
  });

  const handleSelectionModelChange = (newSelection: GridSelectionModel) => {
    setSelectionModel(newSelection);
    const selectedZones = rows.filter((row: any) => newSelection.includes(row.id));
    const selectedZoneIDs = selectedZones.map((zone: any) => zone.id);
    window.f1mvli.config.set("Settings.hueSettings.entertainmentZoneIDs", selectedZoneIDs);
  };

  return (
    <div style={{ height: 527, width: "100%", alignItems: "center", alignContent: "center", marginLeft: -0 }}>
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