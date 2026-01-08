import React from "react";
import {
  Box,
  FormControl,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DeleteRounded } from "@mui/icons-material";
import { Action, ActionType } from "../../../shared/types/config";
import { ColorSwatch } from "../shared/ColorSwatch";
import { useConfig } from "../../hooks/useConfig";
import { ActionTypeAutocomplete } from "./ActionTypeAutocomplete";
import { BrightnessSlider } from "./BrightnessSlider";
import { PhilipsHueEnableFadeToggle } from "./PhilipsHueEnableFadeToggle";

interface EventActionProps {
  index: number;
  action: Action;
  actions: Action[];
  setActions: (newValue: Action[]) => void;
}

export function EventAction({
  index,
  action,
  actions,
  setActions,
}: EventActionProps) {
  const { config } = useConfig();
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <ActionTypeAutocomplete
          selectedActionType={action.type}
          onChange={(newValue) => {
            setActions(
              actions.map((action, i) => {
                if (i === index) {
                  return {
                    ...action,
                    type: newValue,
                  };
                }
                return action;
              }),
            );
          }}
        />
        <Tooltip arrow title="Delete action">
          <IconButton
            color="error"
            sx={{ ml: 2 }}
            onClick={() => {
              const newActions = [...actions];
              newActions.splice(index, 1);
              setActions(newActions);
            }}
          >
            <DeleteRounded />
          </IconButton>
        </Tooltip>
      </Box>
      {action.type === ActionType.ON && (
        <Box mt={2}>
          <ColorSwatch
            color={action.color ?? { r: 0, g: 0, b: 0 }}
            onChange={(rgbColor) => {
              setActions(
                actions.map((action, i) => {
                  if (i === index) {
                    return {
                      ...action,
                      color: rgbColor,
                    };
                  }
                  return action;
                }),
              );
            }}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <FormControl sx={{ mr: 2, mt: 3 }}>
              <Typography gutterBottom>Brightness</Typography>
              <BrightnessSlider
                value={action.brightness ?? 0}
                onChange={(newValue) => {
                  setActions(
                    actions.map((action, i) => {
                      if (i === index) {
                        return {
                          ...action,
                          brightness: newValue,
                        };
                      }
                      return action;
                    }),
                  );
                }}
              />
              {config.philipsHueEnabled && (
                <PhilipsHueEnableFadeToggle
                  action={action}
                  actions={actions}
                  index={index}
                  setActions={setActions}
                />
              )}
            </FormControl>
          </Box>
        </Box>
      )}
      {action.type === ActionType.OFF && (
        <Box mt={2}>
          {config.philipsHueEnabled && (
            <PhilipsHueEnableFadeToggle
              action={action}
              actions={actions}
              index={index}
              setActions={setActions}
            />
          )}
        </Box>
      )}
      {action.type === ActionType.DELAY && (
        <TextField
          sx={{ width: 200 }}
          margin="normal"
          type="number"
          label="Delay"
          defaultValue={action.delay}
          InputProps={{
            endAdornment: (
              <Typography sx={{ ml: 1 }} color="text.disabled">
                milliseconds
              </Typography>
            ),
          }}
          onChange={(e) => {
            setActions(
              actions.map((action, i) => {
                if (i === index) {
                  return {
                    ...action,
                    delay: Number(e.target.value),
                  };
                }
                return action;
              }),
            );
          }}
        />
      )}
    </>
  );
}
