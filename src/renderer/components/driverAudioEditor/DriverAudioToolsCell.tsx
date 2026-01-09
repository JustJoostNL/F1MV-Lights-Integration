import React, { useCallback, useState } from "react";
import {
  PlayArrowRounded,
  LibraryAddRounded,
  DeleteRounded,
  KeyboardArrowDown,
  EditRounded,
} from "@mui/icons-material";
import { Menu, MenuItem, Button, ListItemIcon } from "@mui/material";
import { GridRenderCellParams, GridRowId } from "@mui/x-data-grid";
import { useConfig } from "../../hooks/useConfig";

interface DriverAudioToolsCellProps {
  handleEdit: (alertId: GridRowId) => void;
  handleDuplicate: (alertId: GridRowId) => void;
  handleDelete: (alertId: GridRowId) => void;
  params: GridRenderCellParams;
}

export function DriverAudioToolsCell({
  handleEdit,
  handleDuplicate,
  handleDelete,
  params,
}: DriverAudioToolsCellProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { config } = useConfig();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [],
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleSimulateClick = useCallback(async () => {
    setAnchorEl(null);
    const alert = (config.driverAudioAlerts ?? []).find(
      (a) => a.id === params.id,
    );
    if (!alert || !alert.events.length || !alert.driverNumber.trim()) return;

    if (alert.filePath) {
      await window.f1mvli.utils.playAudio(alert.filePath, 1.0);
    } else {
      const defaultAudioPath = await window.f1mvli.utils.getAssetsPath(
        "team_radio_f1fx.wav",
      );
      await window.f1mvli.utils.playAudio(defaultAudioPath, 1.0);
    }
  }, [config, params.id]);

  const handleEditClick = useCallback(() => {
    setAnchorEl(null);
    handleEdit(params.id);
  }, [params.id, handleEdit]);

  const handleDuplicateClick = useCallback(() => {
    setAnchorEl(null);
    handleDuplicate(params.id);
  }, [params.id, handleDuplicate]);

  const handleDeleteClick = useCallback(() => {
    setAnchorEl(null);
    handleDelete(params.id);
  }, [params.id, handleDelete]);

  return (
    <>
      <Button
        variant="outlined"
        disableElevation
        size="small"
        onClick={handleClick}
        endIcon={<KeyboardArrowDown />}
      >
        Actions
      </Button>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleSimulateClick}>
          <ListItemIcon>
            <PlayArrowRounded color="success" />
          </ListItemIcon>
          Test alert
        </MenuItem>
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon>
            <EditRounded color="primary" />
          </ListItemIcon>
          Edit alert
        </MenuItem>
        <MenuItem onClick={handleDuplicateClick}>
          <ListItemIcon>
            <LibraryAddRounded />
          </ListItemIcon>
          Duplicate alert
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteRounded color="error" />
          </ListItemIcon>
          Delete alert
        </MenuItem>
      </Menu>
    </>
  );
}
