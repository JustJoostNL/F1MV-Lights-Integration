import React, { useCallback, useMemo, useState } from "react";
import { Box, Button } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRowId,
  useGridApiRef,
} from "@mui/x-data-grid";
import { AddRounded } from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";
import { useHotkeys } from "react-hotkeys-hook";
import { JSONTree } from "react-json-tree";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { ContentLayout } from "../components/layouts/ContentLayout";
import { useConfig } from "../hooks/useConfig";
import { EventDialog } from "../components/eventEditor/EventDialog";
import { eventTypeReadableMap } from "../../shared/config/config_types";
import { ToolsCell } from "../components/eventEditor/ToolsCell";

export function EventEditorPage() {
  const { config, updateConfig } = useConfig();
  const [debug, setDebug] = useState(false);
  const [editEventDialogOpen, setEditEventDialogOpen] = useState(false);
  const [selectedEventIdIsNew, setSelectedEventIdIsNew] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const gridApiRef = useGridApiRef();

  useDocumentTitle("F1MV Lights Integration - Event Editor");
  useHotkeys("shift+o", () => {
    window.f1mvli.config.open();
  });

  useHotkeys("shift+d", () => {
    setDebug((prev) => !prev);
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
      setSelectedEventId(parseInt(id.toString()));
      setEditEventDialogOpen(true);
    },
    [setSelectedEventId],
  );

  const handleCloseEditDialog = useCallback(() => {
    setEditEventDialogOpen(false);
    if (selectedEventIdIsNew) setSelectedEventIdIsNew(false);
    setSelectedEventId(null);
  }, [selectedEventIdIsNew]);

  const handleShare = useCallback(
    (id: GridRowId) => {
      const event = config.events.find((event) => event.id === id);
      if (!event) return;
      const url =
        "https://api.jstt.me/api/v2/f1mvli/go/app/config/add-event?event=" +
        JSON.stringify(event);
      window.navigator.clipboard.writeText(url);
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
      name: `New Event - ${highestId + 1}`,
      enabled: true,
      triggers: [],
      actions: [],
      goBackToStatic: false,
      amount: 1,
    });
    updateConfig({ events: newEvents });
    setSelectedEventId(highestId + 1);
    setSelectedEventIdIsNew(true);
    gridApiRef.current?.setPage(
      Math.ceil(
        (highestId + 1) /
          gridApiRef.current.state.pagination.paginationModel.pageSize,
      ),
    );
    setEditEventDialogOpen(true);
    enqueueSnackbar("New event created", { variant: "success" });
  }, [config, updateConfig, gridApiRef]);

  const handleDuplicate = useCallback(
    (id: GridRowId) => {
      const event = config.events.find((event) => event.id === id);
      if (!event) return;
      const newEvents = [...config.events];
      const highestId = newEvents.reduce((prev, curr) => {
        if (curr.id > prev) return curr.id;
        return prev;
      }, 0);
      const newEvent = {
        ...event,
        id: highestId + 1,
        name: `${event.name} (Copy)`,
      };
      newEvents.push(newEvent);
      updateConfig({ events: newEvents });
      setSelectedEventId(highestId + 1);
      setSelectedEventIdIsNew(true);
      gridApiRef.current?.setPage(
        Math.ceil(
          (highestId + 1) /
            gridApiRef.current.state.pagination.paginationModel.pageSize,
        ),
      );
      setEditEventDialogOpen(true);
      enqueueSnackbar("New event created", { variant: "success" });
    },
    [config, updateConfig, gridApiRef],
  );

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
        width: 130,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <ToolsCell
            params={params}
            handleEdit={handleEdit}
            handleDuplicate={handleDuplicate}
            handleShare={handleShare}
            handleDelete={handleDelete}
          />
        ),
      },
    ],
    [handleDelete, handleEdit, handleShare, handleDuplicate],
  );

  const rows = useMemo(() => {
    return config.events.map((event) => {
      const triggers = event.triggers.map((trigger) => {
        return eventTypeReadableMap[trigger];
      });
      return {
        id: event.id,
        name: event.name,
        enabled: event.enabled ? "Yes" : "No",
        triggers: triggers.join(", "),
        actions: event.actions.length,
        amount: event.amount,
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
          apiRef={gridApiRef}
          rows={rows}
          columns={columns}
          disableColumnFilter
          disableColumnSelector
          disableColumnMenu
          disableRowSelectionOnClick
          checkboxSelection={false}
          pageSizeOptions={[8, 12, 16]}
          initialState={{ pagination: { paginationModel: { pageSize: 8 } } }}
          sx={{
            "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
              outline: "none !important",
            },
          }}
        />
        {debug && <JSONTree data={config.events} />}
      </Box>
      <EventDialog
        open={editEventDialogOpen}
        onClose={handleCloseEditDialog}
        eventId={selectedEventId}
        isNew={selectedEventIdIsNew}
      />
    </ContentLayout>
  );
}
