import React, { useState } from "react";
import { Button } from "@mui/material";
import { ColorCustomizationDialog } from "./ColorCustomizationDialog";

export function ColorCustomization() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="contained"
        onClick={() => {
          setOpen(true);
        }}
      >
        Customize colors
      </Button>
      <ColorCustomizationDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
