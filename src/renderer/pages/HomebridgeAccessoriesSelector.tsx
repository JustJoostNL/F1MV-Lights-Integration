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

async function getHomebridgeIntegrationState() {
  return await window.f1mvli.utils.getIntegrationStates().then((states) => {
    return states.find((state) => state.name === "homebridge")?.state;
  });
}

export function HomebridgeAccessoriesSelector() {
  const { config, updateConfig } = useConfig();
  const [debug, setDebug] = useState(false);

  useHotkeys("shift+d", () => {
    setDebug((prev) => !prev);
  });

  const { data, mutate } = useSWR(
    "homebridgeAccessories",
    async () => {
      const data = await window.f1mvli.integrations.homebridge.getAccessories();

      return {
        accessories: data.accessories,
        selectedDevices: data.selectedAccessories,
      };
    },
    { refreshInterval: 2000 },
  );

  const { data: homebridgeState } = useSWR(
    "integrationStates",
    getHomebridgeIntegrationState,
    {},
  );

  const rows = useMemo(() => {
    if (!data?.accessories) return [];

    return data?.accessories.map((accessory) => ({
      id: accessory.uniqueId,
      name: accessory.accessoryInformation.Name,
      state: accessory.values.On ? "On" : "Off",
    }));
  }, [data?.accessories]);

  const handleSelectionModelChange = useCallback(
    (newSelection: GridRowSelectionModel) => {
      if (!data) return;
      const selectedIds = Array.from(newSelection.ids);
      const selectedAccessories = rows.filter((row) =>
        selectedIds.includes(row.id),
      );
      const selectedAccessoriesIds = selectedAccessories.map(
        (device) => device.id,
      );

      mutate({ ...data, selectedDevices: selectedAccessoriesIds }, false);
      updateConfig({
        homebridgeAccessories: selectedAccessoriesIds,
      });
    },
    [rows, data, mutate, updateConfig],
  );

  return (
    <ContentLayout container title="Select Homebridge Accessories">
      <Box
        sx={{
          alignContent: "center",
          alignItems: "center",
          mb: 5,
        }}
      >
        {homebridgeState ? (
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
            {debug && <JSONTree data={config.homebridgeAccessories} />}
          </>
        ) : (
          <Alert severity="error">
            The app is not connected to Homebridge. Please check your Homebridge
            configuration and try again.
          </Alert>
        )}
      </Box>
    </ContentLayout>
  );
}
