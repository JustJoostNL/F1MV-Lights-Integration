import React, { useCallback, useMemo, useState } from "react";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import { DataGrid, GridColDef, GridRowId } from "@mui/x-data-grid";
import {
  Edit,
  DeleteRounded,
  IosShareOutlined,
  PlayArrowRounded,
  AddRounded,
} from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";
import { useHotkeys } from "react-hotkeys-hook";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { ContentLayout } from "../components/layouts/ContentLayout";
import { useConfig } from "../hooks/useConfig";
import { EditEventDialog } from "../components/eventEditor/EditEventDialog";
import { eventTypeReadableMap } from "../../shared/config/config_types";

export function EventEditorPage() {
  const { config, updateConfig } = useConfig();
  const [editEventDialogOpen, setEditEventDialogOpen] = useState(false);
  const [selectedEffectId, setSelectedEffectId] = useState<number | null>(null);

  useDocumentTitle("F1MV Lights Integration - Event Editor");
  useHotkeys("shift+o", () => {
    window.f1mvli.config.open();
  });

  const handleDelete = useCallback(
    (id: GridRowId) => {
      const newEvents = config.events.filter((event) => event.id !== id);
      updateConfig({ events: newEvents });
      enqueueSnackbar("Event deleted", { variant: "success" });
    },
    [config, updateConfig],
  );

  const handleEdit = useCallback(
    (id: GridRowId) => {
      setSelectedEffectId(parseInt(id.toString()));
      setEditEventDialogOpen(true);
    },
    [setSelectedEffectId],
  );

  const handleCloseEditDialog = useCallback(() => {
    setEditEventDialogOpen(false);
    setSelectedEffectId(null);
  }, []);

  const handleShare = useCallback(
    (id: GridRowId) => {
      const event = config.events.find((event) => event.id === id);
      if (!event) return;
      window.navigator.clipboard.writeText(JSON.stringify(event));
      enqueueSnackbar("Event url copied to clipboard", { variant: "success" });
    },
    [config],
  );

  const handleClickCreateNewEvent = useCallback(() => {
    const newEvents = [...config.events];
    const highestId = newEvents.reduce((prev, curr) => {
      if (curr.id > prev) return curr.id;
      return prev;
    }, 0);
    newEvents.push({
      id: highestId + 1,
      name: "New Event",
      enabled: true,
      triggers: [],
      actions: [],
      amount: 1,
    });
    updateConfig({ events: newEvents });
    setSelectedEffectId(highestId + 1);
    setEditEventDialogOpen(true);
    enqueueSnackbar("New event created", { variant: "success" });
  }, [config, updateConfig]);

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "name", headerName: "Name", width: 250 },
      { field: "enabled", headerName: "Enabled", width: 100 },
      { field: "triggers", headerName: "Triggers", width: 200 },
      { field: "actions", headerName: "Actions", width: 100 },
      { field: "amount", headerName: "Repeat Amount", width: 130 },
      {
        field: "edit",
        headerName: "Tools",
        width: 150,
        renderCell: (params) => (
          <>
            <Tooltip arrow title="Simulate event">
              <IconButton size="small" onClick={() => {}}>
                <PlayArrowRounded />
              </IconButton>
            </Tooltip>
            <Tooltip arrow title="Edit event">
              <IconButton size="small" onClick={() => handleEdit(params.id)}>
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip arrow title="Share event">
              <IconButton size="small" onClick={() => handleShare(params.id)}>
                <IosShareOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip arrow title="Delete event">
              <IconButton size="small" onClick={() => handleDelete(params.id)}>
                <DeleteRounded />
              </IconButton>
            </Tooltip>
          </>
        ),
      },
    ],
    [handleDelete, handleEdit, handleShare],
  );

  const rows = useMemo(() => {
    return config.events.map((effect) => {
      const triggers = effect.triggers.map((trigger) => {
        return eventTypeReadableMap[trigger];
      });
      return {
        id: effect.id,
        name: effect.name,
        enabled: effect.enabled ? "Yes" : "No",
        triggers: triggers.join(", "),
        actions: effect.actions.length,
        amount: effect.amount,
        edit: "Edit",
      };
    });
  }, [config]);

  return (
    <ContentLayout container titleVariant="h2" title="Event Editor">
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
          onClick={handleClickCreateNewEvent}
        >
          Create new event
        </Button>
        <DataGrid
          rows={rows}
          columns={columns}
          disableColumnFilter
          disableColumnSelector
          disableColumnMenu
          disableRowSelectionOnClick
          checkboxSelection={false}
        />
      </Box>
      <EditEventDialog
        open={editEventDialogOpen}
        onClose={handleCloseEditDialog}
        eventId={selectedEffectId ?? 0}
      />
    </ContentLayout>
  );
}
