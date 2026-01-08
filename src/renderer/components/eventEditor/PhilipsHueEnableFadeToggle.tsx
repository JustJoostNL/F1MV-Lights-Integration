import React from "react";
import {
  Button,
  FormControlLabel,
  Stack,
  Switch,
  Tooltip,
} from "@mui/material";
import { Action } from "../../../shared/types/config";

interface PhilipsHueEnableFadeToggleProps {
  action: Action;
  actions: Action[];
  index: number;
  setActions: (newValue: Action[]) => void;
}

export function PhilipsHueEnableFadeToggle({
  action,
  actions,
  index,
  setActions,
}: PhilipsHueEnableFadeToggleProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <FormControlLabel
        control={<Switch />}
        label="Philips Hue - Enable Fade"
        sx={{ mb: 1 }}
        checked={action.philipsHueEnableFade ?? false}
        onChange={() => {
          setActions(
            actions.map((action, i) => {
              if (i === index) {
                return {
                  ...action,
                  philipsHueEnableFade: !action.philipsHueEnableFade,
                };
              }
              return action;
            }),
          );
        }}
      />
      <Tooltip title="If you press this reset button the default fade setting for Philips Hue will be used">
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setActions(
              actions.map((action, i) => {
                if (i === index) {
                  delete action.philipsHueEnableFade;
                }
                return action;
              }),
            );
          }}
        >
          Reset
        </Button>
      </Tooltip>
    </Stack>
  );
}
