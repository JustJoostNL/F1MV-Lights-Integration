import React, { useCallback, useMemo, useState } from "react";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { Alert, Box, Paper, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import useSWR from "swr";
import { ContentLayout } from "../components/layouts/ContentLayout";
import { useConfig } from "../hooks/useConfig";
import { IntegrationPlugin } from "../../shared/types/integration";

const columns: GridColDef[] = [
  { field: "label", headerName: "Name", flex: 1, minWidth: 200 },
  { field: "id", headerName: "ID", flex: 1, minWidth: 250 },
  { field: "state", headerName: "State", width: 100 },
];

export function PhilipsHueGroupSelector() {
  const { updateConfig } = useConfig();
  const [searchText, setSearchText] = useState("");

  // Fetch groups using utility function
  const { data, mutate, error } = useSWR(
    "philipsHue-groups",
    async () => {
      const result = await window.f1mvli.integrationManager.callUtility(
        IntegrationPlugin.PHILIPSHUE,
        "getGroups",
      );
      if (!result) return { groups: [], selectedGroups: [] };
      const groupData = result as {
        groups: { id: string; name: string; state: boolean }[];
        selectedGroups: string[];
      };
      return {
        groups: groupData.groups.map((g) => ({
          id: g.id,
          label: g.name,
          state: g.state ? "On" : "Off",
        })),
        selectedGroups: groupData.selectedGroups,
      };
    },
    { refreshInterval: 2000 },
  );

  const { data: isOnline } = useSWR(
    `online-${IntegrationPlugin.PHILIPSHUE}`,
    () =>
      window.f1mvli.integrationManager.isOnline(IntegrationPlugin.PHILIPSHUE),
    { refreshInterval: 5000 },
  );

  const filteredRows = useMemo(() => {
    if (!data?.groups) return [];
    if (!searchText) return data.groups;
    const lower = searchText.toLowerCase();
    return data.groups.filter((g) =>
      Object.values(g).some((v) => String(v).toLowerCase().includes(lower)),
    );
  }, [data?.groups, searchText]);

  const handleSelectionChange = useCallback(
    (selection: GridRowSelectionModel) => {
      if (!data) return;
      const ids = Array.from(selection.ids).map(String);
      mutate({ ...data, selectedGroups: ids }, false);
      updateConfig({ philipsHueGroupIds: ids });
    },
    [data, mutate, updateConfig],
  );

  const isLoading = isOnline === undefined && !error;

  return (
    <ContentLayout container title="" hideTitle isLoading={isLoading}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, my: 2 }}>
        {error ? (
          <Alert severity="error">Error loading groups.</Alert>
        ) : !isOnline ? (
          <Alert severity="warning">Integration is offline.</Alert>
        ) : (
          <>
            <TextField
              placeholder="Search groups..."
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
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 25 } },
                }}
                rowSelectionModel={{
                  type: "include",
                  ids: new Set(data?.selectedGroups || []),
                }}
                onRowSelectionModelChange={handleSelectionChange}
                localeText={{
                  noRowsLabel: searchText
                    ? "No groups match your search"
                    : "No groups found",
                }}
                sx={{
                  "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
                    outline: "none !important",
                  },
                  minHeight: 500,
                }}
              />
            </Paper>
          </>
        )}
      </Box>
    </ContentLayout>
  );
}
