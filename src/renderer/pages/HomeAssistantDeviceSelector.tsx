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
  { field: "id", headerName: "ID", width: 200 },
  { field: "state", headerName: "State", width: 100 },
];

async function getHomeAssistantIntegrationState() {
  return await window.f1mvli.utils.getIntegrationStates().then((states) => {
    return states.find((state) => state.name === "homeAssistant")?.state;
  });
}

export function HomeAssistantDeviceSelector() {
  const { config, updateConfig } = useConfig();
  const [debug, setDebug] = useState(false);

  useHotkeys("shift+d", () => {
    setDebug((prev) => !prev);
  });

  const { data, mutate } = useSWR(
    "homeAssistantDevices",
    async () => {
      const data = await window.f1mvli.integrations.homeAssistant.getDevices();
      return { devices: data.devices, selectedDevices: data.selectedDevices };
    },
    { refreshInterval: 2000 },
  );

  const { data: homeAssistantState } = useSWR(
    "integrationStates",
    getHomeAssistantIntegrationState,
    {},
  );

  const rows = useMemo(() => {
    if (!data?.devices) return [];
    return data?.devices.map((device) => ({
      id: device.entity_id,
      name: device.attributes.friendly_name,
      state: device.state,
    }));
  }, [data?.devices]);

  const handleSelectionModelChange = useCallback(
    (newSelection: GridRowSelectionModel) => {
      if (!data) return;
      const selectedIds = Array.from(newSelection.ids);
      const selectedDevices = rows.filter((row) =>
        selectedIds.includes(row.id),
      );
      const selectedDeviceIds = selectedDevices.map((device) => device.id);
      mutate({ ...data, selectedDevices: selectedDeviceIds }, false);
      updateConfig({
        homeAssistantDevices: selectedDeviceIds,
      });
    },
    [rows, data, mutate, updateConfig],
  );

  return (
    <ContentLayout container title="Select Home Assistant Devices">
      <Box
        sx={{
          alignContent: "center",
          alignItems: "center",
          mb: 5,
        }}
      >
        {homeAssistantState ? (
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
              rowSelectionModel={{
                type: "include",
                ids: new Set(data?.selectedDevices || []),
              }}
              onRowSelectionModelChange={handleSelectionModelChange}
              sx={{
                "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
                  outline: "none !important",
                },
              }}
            />
            {debug && <JSONTree data={config.homeAssistantDevices} />}
          </>
        ) : (
          <Alert severity="error">
            The app is not connected to Home Assistant. Please check your Home
            Assistant configuration and try again.
          </Alert>
        )}
      </Box>
    </ContentLayout>
  );
}
