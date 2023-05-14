import { IActionOptions, IAddEffectActionProps } from "@/components/effect-editor/types";
import { Autocomplete, FormControl, IconButton, Typography, TextField, Divider } from "@mui/material";
import { ColorPicker } from "@/components/effect-editor/ColorPicker";
import DeleteIcon from "@mui/icons-material/Delete";
import React, { useEffect, useState } from "react";
import { BlueSlider } from "@/components/settings/BlueSlider";

export default function AddEffectAction({ index, action, actions, setActions }: IAddEffectActionProps) {
  const [theColor, setTheColor] = useState(action.color);
  useEffect(() => {
    setTheColor(action.color); // Update theColor state when action.color changes
  }, [action.color]);
  console.log(theColor);
  const handleTypeChange = (value: any) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], type: value };
    setActions(newActions);
  };

  const handleColorChange = (color: any) => {
    setTheColor(color);
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], color: color };
    setActions(newActions);
  };

  const handleBrightnessChange = (value: any) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], brightness: value };
    setActions(newActions);
  };

  const handleDelayChange = (value: any) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], delay: value };
    setActions(newActions);
  };

  const handleRChange = (value: any) => {
    setTheColor({ ...theColor, r: value });
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], color: { ...theColor, r: value } };
    setActions(newActions);
  };

  const handleGChange = (value: any) => {
    setTheColor({ ...theColor, g: value });
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], color: { ...theColor, g: value } };
    setActions(newActions);
  };

  const handleBChange = (value: any) => {
    setTheColor({ ...theColor, b: value });
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], color: { ...theColor, b: value } };
    setActions(newActions);
  };

  const actionOptions: IActionOptions = {
    on: "On",
    off: "Off",
    delay: "Delay",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", marginBottom: 2 }}>
      <Divider sx={{ mt: 2, mb: 2 }} />
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <FormControl sx={{ mr: 2 }}>
          <Autocomplete
            sx={{ width: 130 }}
            autoComplete={true}
            autoSelect={true}
            clearIcon={false}
            autoHighlight={true}
            color={"secondary"}
            value={action.type}
            onChange={(evt, value) => handleTypeChange(value)}
            options={Object.keys(actionOptions)}
            getOptionLabel={(key) => actionOptions[key as keyof typeof actionOptions]}
            renderInput={(params) => <TextField color={"secondary"} {...params} label="Type" />}
          />
        </FormControl>
        <IconButton
          onClick={() => {
            const newActions = [...actions];
            newActions.splice(index, 1);
            setActions(newActions);
          }}>
          <DeleteIcon />
        </IconButton>
      </div>
      {(action.type === "on") &&
        <div style={{ display: "flex", flexDirection: "column", marginTop: "10px" }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <ColorPicker
              color={theColor}
              onChange={(color) => handleColorChange(color)}
              sx={{ marginLeft: 2, marginBottom: 4, marginTop: 20 }} />
            <div style={{ marginLeft: 100, marginTop: 20, display: "flex", flexDirection: "column" }}>
              <TextField
                sx={{ m: 1, width: 120 }}
                color="secondary"
                variant="outlined"
                label="Red value"
                inputProps={{ step: 1, min: 0, max: 255, type: "number" }}
                onChange={(event) => handleRChange(parseInt(event.target.value))}
                value={theColor.r}
              />
              <TextField
                sx={{ m: 1, width: 120 }}
                color="secondary"
                variant="outlined"
                label="Green value"
                inputProps={{ step: 1, min: 0, max: 255, type: "number" }}
                onChange={(event) => handleGChange(parseInt(event.target.value))}
                value={theColor.g}
              />
              <TextField
                sx={{ m: 1, width: 120 }}
                color="secondary"
                variant="outlined"
                label="Blue value"
                inputProps={{ step: 1, min: 0, max: 255, type: "number" }}
                onChange={(event) => handleBChange(parseInt(event.target.value))}
                value={theColor.b}
              />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <FormControl sx={{ mr: 2, mt: 3 }}>
              <Typography id="brightness-slider" gutterBottom>
                Brightness
              </Typography>
              <BlueSlider id={"brightness"} value={action.brightness} onChange={(evt, value) => handleBrightnessChange(value)} />
            </FormControl>
          </div>
        </div>
      }
      {(action.type === "delay") &&
        <TextField
          sx={{ width: 200 }}
          margin="normal"
          color={"secondary"}
          type="number"
          label="Delay (ms)"
          value={action.delay}
          onChange={(e) => handleDelayChange(e.target.value)}
        />
      }
    </div>
  );
}