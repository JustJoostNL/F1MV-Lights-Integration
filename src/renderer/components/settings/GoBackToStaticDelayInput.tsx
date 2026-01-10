import React, { useCallback } from "react";
import { TextField, Typography } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function GoBackToStaticDelayInput() {
  const { config, updateConfig } = useConfig();

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value === "" ? undefined : event.target.value;
      if (!value) {
        updateConfig({ goBackToStaticDelay: undefined });
        return;
      }
      const intValue = parseInt(value, 10);
      updateConfig({ goBackToStaticDelay: intValue });
    },
    [updateConfig],
  );

  return (
    <TextField
      type="number"
      label="Delay"
      defaultValue={config.goBackToStaticDelay}
      InputProps={{
        endAdornment: (
          <Typography sx={{ ml: 1 }} color="text.disabled">
            milliseconds
          </Typography>
        ),
      }}
      onChange={handleInputChange}
    />
  );
}
