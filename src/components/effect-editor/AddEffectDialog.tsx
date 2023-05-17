import { IAddEffectDialogProps } from "@/components/effect-editor/types";
import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog, DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Switch,
  TextField,
  Autocomplete, Typography
} from "@mui/material";
import { flagNameMaps } from "@/components/effect-editor/EffectEditor";
import AddEffectAction from "@/components/effect-editor/AddEffectAction";
import Divider from "@mui/material/Divider";

export default function AddEffectDialog({ open, onClose, onSubmit }: IAddEffectDialogProps) {
  const [effectName, setEffectName] = useState("");
  const [selectedTrigger, setSelectedTrigger] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [actions, setActions] = useState<any>([]);
  const [amount, setAmount] = useState<number>(1);
  const [highestEffectId, setHighestEffectId] = useState(0);

  useEffect(() => {
    setEffectName("");
    setSelectedTrigger("");
    setEnabled(false);
    setActions([]);
    setAmount(1);
  }, [open]);

  useEffect(() => {
    async function fetchHighestEffectId() {
      const highestId = await window.f1mvli.utils.getHighestEffectId();
      setHighestEffectId(highestId);
    }
    fetchHighestEffectId();
  }, []);

  const handleAddAction = () => {
    setActions([...actions, { type: "on", color: { r: 255, g: 255, b: 255 }, brightness: 100 }]);
  };

  const handleSubmit = () => {
    const newEffect = {
      name: effectName,
      id: highestEffectId + 1,
      trigger: selectedTrigger,
      enabled: enabled,
      actions: actions,
      amount: amount,
    };
    onSubmit(newEffect);
  };

  return (
    <div>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Create Effect</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Effect Name"
            type="text"
            color={"secondary"}
            fullWidth
            value={effectName}
            onChange={(e) => setEffectName(e.target.value)}
          />
          <FormControl fullWidth margin="normal">
            <Autocomplete
              autoComplete={true}
              autoSelect={true}
              clearIcon={false}
              autoHighlight={true}
              fullWidth
              color="secondary"
              options={Object.keys(flagNameMaps)}
              getOptionLabel={(key) => flagNameMaps[key as keyof typeof flagNameMaps]}
              onChange={(event, newValue) => {
                setSelectedTrigger(newValue as string);
              }}
              renderInput={(params) => <TextField color={"secondary"} {...params} label="Trigger" />}
            />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <FormControlLabel control={<Switch color={"secondary"} />} label="Enable effect" sx={{ mb: 1 }} checked={enabled} onChange={() => setEnabled(!enabled)} />
          </FormControl>
          {actions.map((action: any, index: number) => (
            <React.Fragment key={index}>
              <Typography variant="body2" component="div" sx={{ color: "grey" }}>
                Action {index + 1}
              </Typography>
              <AddEffectAction index={index} action={action} actions={actions} setActions={setActions} />
            </React.Fragment>
          ))}
          <Divider sx={{ mt: 2, mb: 2 }} />
          <Button variant="outlined" color="secondary" onClick={handleAddAction} sx={{ mb: 2 }}>
            Add Action
          </Button>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" component="div" sx={{ color: "grey", mb: -0.5, mt: 1 }}>
            How many times should this effect repeat? (Fill in 1 if you don't want it to repeat)
          </Typography>
          <TextField
            sx={{
              width: "30%",
              mr: 35,
            }}
            margin="normal"
            type="number"
            label="Repeat Amount"
            value={amount}
            color={"secondary"}
            onChange={(e) => setAmount(parseInt(e.target.value))}
          />
          <Typography variant="body2" component="div" sx={{ color: "grey", mb: -0.5, mt: 1 }}>
            Note: If you want to repeat an effect, make sure to add a delay at the end of the effect. Otherwise, it will instantly go from the last action to the first action.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color={"secondary"} onClick={onClose}>Cancel</Button>
          <Button color={"secondary"} onClick={handleSubmit} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}