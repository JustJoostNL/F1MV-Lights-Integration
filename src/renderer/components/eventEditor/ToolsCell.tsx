import React, { useCallback, useState } from "react";
import {
  PlayArrowRounded,
  LibraryAddRounded,
  IosShareOutlined,
  DeleteRounded,
  KeyboardArrowDown,
  EditRounded,
} from "@mui/icons-material";
import { Menu, MenuItem, Button, ListItemIcon } from "@mui/material";
import { GridRenderCellParams, GridRowId } from "@mui/x-data-grid";

interface ToolsCellProps {
  handleEdit: (eventId: GridRowId) => void;
  handleDuplicate: (eventId: GridRowId) => void;
  handleShare: (eventId: GridRowId) => void;
  handleDelete: (eventId: GridRowId) => void;
  params: GridRenderCellParams;
}

export function ToolsCell({
  handleEdit,
  handleDuplicate,
  handleShare,
  handleDelete,
  params,
}: ToolsCellProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [],
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleSimulateClick = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleEditClick = useCallback(() => {
    setAnchorEl(null);
    handleEdit(params.id);
  }, [params.id, handleEdit]);

  const handleDuplicateClick = useCallback(() => {
    setAnchorEl(null);
    handleDuplicate(params.id);
  }, [params.id, handleDuplicate]);

  const handleShareClick = useCallback(() => {
    setAnchorEl(null);
    handleShare(params.id);
  }, [params.id, handleShare]);

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
          Simulate event
        </MenuItem>
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon>
            <EditRounded color="primary" />
          </ListItemIcon>
          Edit event
        </MenuItem>
        <MenuItem onClick={handleDuplicateClick}>
          <ListItemIcon>
            <LibraryAddRounded />
          </ListItemIcon>
          Duplicate event
        </MenuItem>
        <MenuItem onClick={handleShareClick}>
          <ListItemIcon>
            <IosShareOutlined color="warning" />
          </ListItemIcon>
          Share event
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteRounded color="error" />
          </ListItemIcon>
          Delete event
        </MenuItem>
      </Menu>
    </>
  );
}
