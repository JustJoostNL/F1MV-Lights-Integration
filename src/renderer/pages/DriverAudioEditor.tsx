import React, { useCallback, useMemo, useState } from "react";
import { Box, Button, Chip } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRowId,
  useGridApiRef,
} from "@mui/x-data-grid";
import { AddRounded, MusicNoteRounded } from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";
import { useHotkeys } from "react-hotkeys-hook";
import { JSONTree } from "react-json-tree";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { ContentLayout } from "../components/layouts/ContentLayout";
import { useConfig } from "../hooks/useConfig";
import {
  driverAudioEventReadableMap,
  DriverAudioEventType,
  IDriverAudioAlert,
} from "../../shared/types/config";
import { DriverAudioDialog } from "../components/driverAudioEditor/DriverAudioDialog";
import { DriverAudioToolsCell } from "../components/driverAudioEditor/DriverAudioToolsCell";
import { useDebug } from "../hooks/useDebug";

export function DriverAudioEditorPage() {
  const { config, updateConfig } = useConfig();
  const debug = useDebug();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAlertIdIsNew, setSelectedAlertIdIsNew] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const gridApiRef = useGridApiRef();

  useDocumentTitle("F1MV Lights Integration - Driver Audio Editor");

  useHotkeys("shift+o", () => {
    window.f1mvli.config.open();
  });

  const handleDelete = useCallback(
    (id: GridRowId) => {
      const newAlerts = (config.driverAudioAlerts ?? []).filter(
        (alert) => alert.id !== id,
      );
      updateConfig({ driverAudioAlerts: newAlerts });
      enqueueSnackbar("Driver audio alert deleted", { variant: "success" });
    },
    [config, updateConfig],
  );

  const handleEdit = useCallback((id: GridRowId) => {
    setSelectedAlertId(parseInt(id.toString()));
    setEditDialogOpen(true);
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setEditDialogOpen(false);
    if (selectedAlertIdIsNew) setSelectedAlertIdIsNew(false);
    setSelectedAlertId(null);
  }, [selectedAlertIdIsNew]);

  const handleClickCreateNew = useCallback(() => {
    const alerts = config.driverAudioAlerts ?? [];
    const highestId = alerts.reduce((prev, curr) => {
      if (curr.id > prev) return curr.id;
      return prev;
    }, 0);

    const newAlert: IDriverAudioAlert = {
      id: highestId + 1,
      driverNumber: "",
      events: [DriverAudioEventType.FASTEST_LAP],
      enabled: true,
    };

    updateConfig({ driverAudioAlerts: [...alerts, newAlert] });
    setSelectedAlertId(highestId + 1);
    setSelectedAlertIdIsNew(true);
    gridApiRef.current?.setPage(
      Math.ceil(
        (highestId + 1) /
          gridApiRef.current.state.pagination.paginationModel.pageSize,
      ),
    );
    setEditDialogOpen(true);
    enqueueSnackbar("New driver audio alert created", { variant: "success" });
  }, [config, updateConfig, gridApiRef]);

  const handleDuplicate = useCallback(
    (id: GridRowId) => {
      const alerts = config.driverAudioAlerts ?? [];
      const alert = alerts.find((a) => a.id === id);
      if (!alert) return;

      const highestId = alerts.reduce((prev, curr) => {
        if (curr.id > prev) return curr.id;
        return prev;
      }, 0);

      const newAlert: IDriverAudioAlert = {
        ...alert,
        id: highestId + 1,
        driverNumber: alert.driverNumber,
        label: alert.label ? `${alert.label} (Copy)` : undefined,
      };

      updateConfig({ driverAudioAlerts: [...alerts, newAlert] });
      setSelectedAlertId(highestId + 1);
      setSelectedAlertIdIsNew(true);
      gridApiRef.current?.setPage(
        Math.ceil(
          (highestId + 1) /
            gridApiRef.current.state.pagination.paginationModel.pageSize,
        ),
      );
      setEditDialogOpen(true);
      enqueueSnackbar("Driver audio alert duplicated", { variant: "success" });
    },
    [config, updateConfig, gridApiRef],
  );

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "driver",
        headerName: "Driver",
        width: 150,
        renderCell: (params) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MusicNoteRounded fontSize="small" />
            <strong>{params.value}</strong>
          </Box>
        ),
      },
      { field: "label", headerName: "Label", width: 180 },
      {
        field: "events",
        headerName: "Events",
        width: 250,
        renderCell: (params) => (
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", py: 0.5 }}>
            {params.value.map((event: string) => (
              <Chip key={event} label={event} size="small" />
            ))}
          </Box>
        ),
      },
      {
        field: "audioFile",
        headerName: "Audio File",
        width: 150,
        renderCell: (params) =>
          params.value ? (
            <Chip label="Custom sound" color="primary" size="small" />
          ) : (
            <Chip label="Default sound" variant="outlined" size="small" />
          ),
      },
      {
        field: "enabled",
        headerName: "Enabled",
        width: 100,
        renderCell: (params) =>
          params.value ? (
            <Chip label="Yes" color="success" size="small" />
          ) : (
            <Chip label="No" color="error" size="small" />
          ),
      },
      {
        field: "tools",
        headerName: "Tools",
        width: 130,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <DriverAudioToolsCell
            params={params}
            handleEdit={handleEdit}
            handleDuplicate={handleDuplicate}
            handleDelete={handleDelete}
          />
        ),
      },
    ],
    [handleDelete, handleEdit, handleDuplicate],
  );

  const rows = useMemo(
    () =>
      (config.driverAudioAlerts ?? []).map((alert) => ({
        id: alert.id,
        driver: alert.driverNumber || "Not set",
        label: alert.label || "-",
        events: alert.events.map((e) => driverAudioEventReadableMap[e]),
        audioFile: alert.filePath,
        enabled: alert.enabled,
      })),
    [config],
  );

  return (
    <ContentLayout container titleVariant="h2" title="Driver Audio Editor">
      <Box
        sx={{
          alignContent: "center",
          alignItems: "center",
          mb: 5,
        }}
      >
        <Button
          variant="contained"
          sx={{ mb: 2 }}
          startIcon={<AddRounded />}
          onClick={handleClickCreateNew}
        >
          Add driver audio alert
        </Button>
        <DataGrid
          apiRef={gridApiRef}
          rows={rows}
          columns={columns}
          disableColumnFilter
          disableColumnSelector
          disableColumnMenu
          disableRowSelectionOnClick
          checkboxSelection={false}
          pageSizeOptions={[8, 12, 16]}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 8 },
            },
          }}
          sx={{
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
            },
            "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
              outline: "none !important",
            },
          }}
        />
      </Box>

      {selectedAlertId && (
        <DriverAudioDialog
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
          alertId={selectedAlertId}
          isNew={selectedAlertIdIsNew}
        />
      )}
      {debug && <JSONTree data={config.driverAudioAlerts} />}
    </ContentLayout>
  );
}
