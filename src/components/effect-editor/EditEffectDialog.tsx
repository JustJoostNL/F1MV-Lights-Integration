import { IEffectEditProps } from "@/components/effect-editor/types";
import React, { useEffect, useState } from "react";
import {
  Autocomplete, Button,
  Dialog, DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel, Switch,
  TextField, Typography
} from "@mui/material";
import { flagNameMaps } from "@/components/effect-editor/EffectEditor";
import AddEffectAction from "@/components/effect-editor/AddEffectAction";
import Divider from "@mui/material/Divider";

export default function EditEffectDialog({ open, onClose, onSubmit, effect }: IEffectEditProps) {
  if (!effect) {
    return null;
  }
  const [effectName, setEffectName] = useState(effect.name);
  const [selectedTrigger, setSelectedTrigger] = useState(effect.trigger);
  const [enabled, setEnabled] = useState(effect.enabled);
  const [actions, setActions] = useState<any>(effect.actions);
  const [amount, setAmount] = useState<number>(effect.amount);

  const handleAddAction = () => {
    setActions([...actions, { type: "on", color: { r: 255, g: 255, b: 255 }, brightness: 100 }]);
  };

  const handleSubmit = () => {
    const editedEffect = {
      name: effectName,
      id: effect.id,
      trigger: selectedTrigger,
      enabled: enabled,
      actions: actions,
      amount: amount,
    };
    onSubmit(editedEffect);
  };

  return (
    <div>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Edit Effect</DialogTitle>
        <DialogContent>
          <TextField
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
              value={selectedTrigger}
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
              width: "40%",
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
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}