import React, { useCallback, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { ColorSwatch } from "../shared/ColorSwatch";
import { useConfig } from "../../hooks/useConfig";

export function GoBackToStaticColorChangeButton() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { config, updateConfig } = useConfig();
  const [color, setColor] = useState(config.goBackToStaticColor);

  const handleClick = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setDialogOpen(false);
    updateConfig({ goBackToStaticColor: color });
  }, [updateConfig, color, setDialogOpen]);

  const handleColorChange = useCallback(
    (color: { r: number; g: number; b: number }) => {
      setColor(color);
    },
    [setColor],
  );

  return (
    <React.Fragment>
      <Button variant="contained" color="primary" onClick={handleClick}>
        Change Color
      </Button>
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>Change Color</DialogTitle>
        <DialogContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mt={2}
          >
            {color && (
              <ColorSwatch color={color} onChange={handleColorChange} />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
