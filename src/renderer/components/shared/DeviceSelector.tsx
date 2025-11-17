import React, { useCallback, useMemo, useState } from "react";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { Alert, Box, Paper, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useHotkeys } from "react-hotkeys-hook";
import { JSONTree } from "react-json-tree";
import useSWR from "swr";
import { ContentLayout } from "../layouts/ContentLayout";
import { useConfig } from "../../hooks/useConfig";
import { IConfig } from "../../../shared/config/config_types";

export interface DeviceSelectorConfig<TDevice, TRawDevice = TDevice> {
  /** Integration name used for state checking */
  integrationName: string;
  /** SWR cache key */
  swrKey: string;
  /** Function to fetch devices from the API */
  fetchDevices: () => Promise<{
    devices: TRawDevice[];
    selectedDevices: string[];
  }>;
  /** Function to transform raw device data to row format */
  transformDevice: (device: TRawDevice) => TDevice & { id: string };
  /** Column definitions for the data grid */
  columns: GridColDef[];
  /** Config key where selected device IDs are stored */
  configKey: keyof IConfig;
}

interface DeviceSelectorProps<TDevice, TRawDevice = TDevice> {
  config: DeviceSelectorConfig<TDevice, TRawDevice>;
}

async function getIntegrationState(integrationName: string) {
  return await window.f1mvli.utils.getIntegrationStates().then((states) => {
    return states.find((state) => state.name === integrationName)?.state;
  });
}

export function DeviceSelector<TDevice, TRawDevice = TDevice>({
  config: selectorConfig,
}: DeviceSelectorProps<TDevice, TRawDevice>) {
  const { config, updateConfig } = useConfig();
  const [debug, setDebug] = useState(false);
  const [searchText, setSearchText] = useState("");

  useHotkeys("shift+d", () => {
    setDebug((prev) => !prev);
  });

  const {
    data,
    mutate,
    error: devicesError,
  } = useSWR(
    selectorConfig.swrKey,
    async () => {
      const data = await selectorConfig.fetchDevices();
      return {
        devices: data.devices,
        selectedDevices: data.selectedDevices,
      };
    },
    { refreshInterval: 2000 },
  );

  const { data: integrationState, error: integrationError } = useSWR(
    `integrationStates-${selectorConfig.integrationName}`,
    () => getIntegrationState(selectorConfig.integrationName),
    {},
  );

  const rows = useMemo(() => {
    if (!data?.devices) return [];
    return data.devices.map((device) => selectorConfig.transformDevice(device));
  }, [data?.devices, selectorConfig]);

  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    const lowerSearch = searchText.toLowerCase();
    return rows.filter((row) => {
      return Object.values(row).some((value) =>
        String(value).toLowerCase().includes(lowerSearch),
      );
    });
  }, [rows, searchText]);

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
        [selectorConfig.configKey]: selectedDeviceIds,
      });
    },
    [rows, data, mutate, updateConfig, selectorConfig.configKey],
  );

  const hasError = devicesError || integrationError;
  const isLoading = integrationState === undefined && !hasError;

  return (
    <ContentLayout container title="" hideTitle isLoading={isLoading}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          my: 2,
        }}
      >
        {hasError ? (
          <Alert severity="error">
            {devicesError
              ? `Error loading devices: ${devicesError.message || "Unknown error"}`
              : `Error checking integration state: ${integrationError?.message || "Unknown error"}`}
            <Box
              component="span"
              sx={{
                display: "block",
                mt: 0.5,
                fontSize: "0.7rem",
                fontStyle: "italic",
                opacity: 0.9,
              }}
            >
              Please ensure that the integration is properly configured
            </Box>
          </Alert>
        ) : (
          integrationState && (
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
                  columns={selectorConfig.columns}
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
                  <JSONTree
                    data={
                      config[selectorConfig.configKey as keyof typeof config]
                    }
                  />
                </Box>
              )}
            </>
          )
        )}
      </Box>
    </ContentLayout>
  );
}
