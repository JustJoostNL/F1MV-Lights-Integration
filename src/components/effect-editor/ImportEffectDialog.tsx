import { IImportEffectsDialogProps } from "@/components/effect-editor/types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  DialogActions,
  Typography
} from "@mui/material";
import React, { useState } from "react";

export default function ImportEffectDialog({ open, onClose, onSubmit }: IImportEffectsDialogProps){
  const [token, setToken] = useState("");
  React.useEffect(() => {
    setToken("");
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Import Effects</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Effect Token"
          type="text"
          color={"secondary"}
          fullWidth
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <Typography variant="body2" component="div" sx={{ color: "grey", mb: -0.5, mt: 1 }}>
          Warning: This overwrites all existing effects when the export all button is used.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button color={"secondary"} onClick={onClose}>Cancel</Button>
        <Button variant={"contained"} color={"secondary"} onClick={() => onSubmit(token)}>Import</Button>
      </DialogActions>
    </Dialog>
  );
}