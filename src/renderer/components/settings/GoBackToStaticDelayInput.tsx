import React, { useCallback } from "react";
import { TextField, Typography } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function GoBackToStaticDelayInput() {
  const { config, updateConfig } = useConfig();

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      await updateConfig({ goBackToStaticDelay: Number(value) });
    },
    [updateConfig],
  );

  return (
    <TextField
      value={config.goBackToStaticDelay}
      onChange={handleInputChange}
      label="Delay"
      variant="outlined"
      type="number"
      inputProps={{
        min: 0,
        max: 100,
        step: 1,
        type: "number",
      }}
      InputProps={{
        endAdornment: (
          <Typography sx={{ ml: 1 }} color="text.disabled">
            seconds
          </Typography>
        ),
      }}
    />
  );
}
