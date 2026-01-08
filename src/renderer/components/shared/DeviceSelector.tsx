import React, { useCallback, useMemo, useState } from "react";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { Alert, Box, Paper, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useHotkeys } from "react-hotkeys-hook";
import { JSONTree } from "react-json-tree";
import useSWR from "swr";
import { ContentLayout } from "../layouts/ContentLayout";
import { useConfig } from "../../hooks/useConfig";
import { IConfig } from "../../../shared/types/config";
import { IntegrationPlugin } from "../../../shared/types/integration";

export interface DeviceSelectorProps {
  /** Integration ID to fetch devices from */
  integrationId: IntegrationPlugin;
  /** Config key where selected device IDs are stored */
  configKey: keyof IConfig;
  /** Column definitions for the data grid */
  columns?: GridColDef[];
  /** Transform device for display (optional, defaults to id/label) */
  transformDevice?: (device: {
    id: string | number;
    label: string;
    state?: boolean;
    metadata?: Record<string, unknown>;
  }) => Record<string, unknown> & { id: string };
}

const defaultColumns: GridColDef[] = [
  { field: "label", headerName: "Name", flex: 1, minWidth: 200 },
  { field: "id", headerName: "ID", flex: 1, minWidth: 200 },
  { field: "state", headerName: "State", width: 100 },
];

const defaultTransform = (device: {
  id: string | number;
  label: string;
  state?: boolean;
}) => ({
  id: String(device.id),
  label: device.label,
  state: device.state ? "On" : "Off",
});

export function DeviceSelector({
  integrationId,
  configKey,
  columns = defaultColumns,
  transformDevice = defaultTransform,
}: DeviceSelectorProps) {
  const { config, updateConfig } = useConfig();
  const [debug, setDebug] = useState(false);
  const [searchText, setSearchText] = useState("");

  useHotkeys("shift+d", () => setDebug((prev) => !prev));

  // Fetch devices using the integrationManager API
  const {
    data,
    mutate,
    error: devicesError,
  } = useSWR(
    `devices-${integrationId}`,
    async () => {
      const result =
        await window.f1mvli.integrationManager.listDevices(integrationId);
      if (!result) return { devices: [], selectedDevices: [] };
      return {
        devices: result.devices,
        selectedDevices: result.selectedDevices.map(String),
      };
    },
    { refreshInterval: 2000 },
  );

  // Check if integration is online
  const { data: isOnline, error: stateError } = useSWR(
    `online-${integrationId}`,
    () => window.f1mvli.integrationManager.isOnline(integrationId),
    { refreshInterval: 5000 },
  );

  const rows = useMemo(() => {
    if (!data?.devices) return [];
    return data.devices.map((device) => transformDevice(device));
  }, [data?.devices, transformDevice]);

  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    const lowerSearch = searchText.toLowerCase();
    return rows.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(lowerSearch),
      ),
    );
  }, [rows, searchText]);

  const handleSelectionModelChange = useCallback(
    (newSelection: GridRowSelectionModel) => {
      if (!data) return;
      const selectedIds = Array.from(newSelection.ids).map(String);
      mutate({ ...data, selectedDevices: selectedIds }, false);
      updateConfig({ [configKey]: selectedIds });
    },
    [data, mutate, updateConfig, configKey],
  );

  const hasError = devicesError || stateError;
  const isLoading = isOnline === undefined && !hasError;

  return (
    <ContentLayout container title="" hideTitle isLoading={isLoading}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, my: 2 }}>
        {hasError ? (
          <Alert severity="error">
            Error loading devices. Please ensure the integration is configured.
          </Alert>
        ) : !isOnline ? (
          <Alert severity="warning">
            Integration is offline. Please check your configuration.
          </Alert>
        ) : (
          <>
            <TextField
              placeholder="Search devices..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              variant="outlined"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ maxWidth: 600 }}
            />
            <Paper elevation={2}>
              <DataGrid
                columns={columns}
                rows={filteredRows}
                checkboxSelection
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 25 } },
                }}
                rowSelectionModel={{
                  type: "include",
                  ids: new Set(data?.selectedDevices || []),
                }}
                onRowSelectionModelChange={handleSelectionModelChange}
                localeText={{
                  noRowsLabel: searchText
                    ? "No devices match your search"
                    : "No devices found",
                }}
                sx={{
                  "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
                    outline: "none !important",
                  },
                  minHeight: 500,
                }}
              />
            </Paper>
            {debug && (
              <Box mt={2}>
                <JSONTree data={config[configKey as keyof typeof config]} />
              </Box>
            )}
          </>
        )}
      </Box>
    </ContentLayout>
  );
}
