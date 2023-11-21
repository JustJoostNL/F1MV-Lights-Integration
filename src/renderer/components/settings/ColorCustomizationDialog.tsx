import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import { ColorSwatch } from "../shared/ColorSwatch";
import { useConfig } from "../../hooks/useConfig";
import { ColorCustomizationEventAutocomplete } from "./ColorCustomizationEventAutocomplete";

interface ColorCustomizationDialogProps {
  open: boolean;
  onClose: () => void;
}

const DEFAULT_EVENT = "greenFlag";

export function ColorCustomizationDialog({
  open,
  onClose,
}: ColorCustomizationDialogProps) {
  const { config, updateConfig } = useConfig();
  const [color, setColor] = useState<{
    r: number;
    g: number;
    b: number;
  }>({ r: 255, g: 255, b: 255 });

  const [selectedEvent, setSelectedEvent] = useState<string>(DEFAULT_EVENT);

  useEffect(() => {
    const storedColor = config.eventColors[selectedEvent];
    if (!storedColor) return;
    setColor(storedColor);
  }, [config.eventColors, selectedEvent, setColor, open]);

  // Reset selected event when dialog is closed
  useEffect(() => {
    setSelectedEvent(DEFAULT_EVENT);
  }, [open]);

  const handleClose = useCallback(
    (isDismissed?: boolean) => {
      if (!isDismissed) {
        updateConfig({
          eventColors: {
            ...config.eventColors,
            [selectedEvent]: color,
          },
        });
      }
      onClose();
    },
    [color, config.eventColors, onClose, selectedEvent, updateConfig],
  );

  return (
    <Dialog
      open={open}
      onClose={() => handleClose(true)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Color Customizer</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            mt: 2,
            gap: 2,
          }}
        >
          <ColorSwatch color={color} onChange={setColor} />
          <ColorCustomizationEventAutocomplete
            setSelectedEvent={setSelectedEvent}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => handleClose(false)}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
