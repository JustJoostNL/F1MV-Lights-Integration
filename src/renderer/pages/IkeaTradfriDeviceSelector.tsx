import React, { useCallback, useMemo, useState } from "react";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { Alert, Box } from "@mui/material";
import { useHotkeys } from "react-hotkeys-hook";
import { JSONTree } from "react-json-tree";
import useSWR from "swr";
import { ContentLayout } from "../components/layouts/ContentLayout";
import { useConfig } from "../hooks/useConfig";

const columns: GridColDef[] = [
  { field: "name", headerName: "Name", width: 200 },
  { field: "id", headerName: "ID", width: 250 },
  { field: "state", headerName: "State", width: 100 },
  { field: "spectrum", headerName: "Spectrum", width: 200 },
];

async function getIkeaTradfriIntegrationState() {
  return await window.f1mvli.utils.getIntegrationStates().then((states) => {
    return states.find((state) => state.name === "tradfri")?.state;
  });
}

export function IkeaTradfriDeviceSelector() {
  const { config, updateConfig } = useConfig();
  const [debug, setDebug] = useState(false);

  useHotkeys("shift+d", () => {
    setDebug((prev) => !prev);
  });

  const { data, mutate } = useSWR(
    "ikeaTradfriDevices",
    async () => {
      const data = await window.f1mvli.integrations.tradfri.getDevices();
      return { devices: data?.devices, selectedDevices: data?.selectedDevices };
    },
    { refreshInterval: 2000 },
  );

  const { data: ikeaTradfriState } = useSWR(
    "integrationStates",
    getIkeaTradfriIntegrationState,
    {},
  );

  const rows = useMemo(() => {
    if (!data?.devices) return [];
    return data?.devices.map((device) => ({
      id: device.id,
      name: device.name,
      state: device.state ? "On" : "Off",
      spectrum: device.spectrum,
    }));
  }, [data?.devices]);

  const handleSelectionModelChange = useCallback(
    (newSelection: GridRowSelectionModel) => {
      if (!data) return;
      const selectedDevices = rows.filter((row) =>
        newSelection.includes(row.id),
      );
      const selectedDeviceIds = selectedDevices.map((device) => device.id);
      mutate({ ...data, selectedDevices: selectedDeviceIds }, false);
      updateConfig({
        ikeaDeviceIds: selectedDeviceIds,
      });
    },
    [rows, data, mutate, updateConfig],
  );

  return (
    <ContentLayout
      container
      title="Select IKEA Tradfri Devices"
      isLoading={ikeaTradfriState === undefined}
    >
      <Box
        sx={{
          alignContent: "center",
          alignItems: "center",
          mb: 5,
        }}
      >
        {ikeaTradfriState ? (
          <>
            <DataGrid
              columns={columns}
              rows={rows}
              disableColumnFilter
              disableColumnSelector
              disableColumnMenu
              disableRowSelectionOnClick
              checkboxSelection
              pageSizeOptions={[8, 12, 16]}
              initialState={{
                pagination: { paginationModel: { pageSize: 8 } },
              }}
              rowSelectionModel={data?.selectedDevices || []}
              onRowSelectionModelChange={handleSelectionModelChange}
              sx={{
                "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
                  outline: "none !important",
                },
              }}
            />
            {debug && <JSONTree data={config.ikeaDeviceIds} />}
          </>
        ) : (
          <Alert severity="error">
            The app is not connected to IKEA Tradfri. Please check your IKEA
            Tradfri configuration and try again.
          </Alert>
        )}
      </Box>
    </ContentLayout>
  );
}
