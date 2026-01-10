import React, { useCallback } from "react";
import { TextField } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function OpenRGBServerPortInput() {
  const { config, updateConfig } = useConfig();

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value === "" ? undefined : event.target.value;
      if (!value) {
        updateConfig({ openrgbServerPort: undefined });
        return;
      }
      const intValue = parseInt(value, 10);
      updateConfig({ openrgbServerPort: intValue });
    },
    [updateConfig],
  );

  return (
    <TextField
      defaultValue={config.openrgbServerPort}
      onChange={handleInputChange}
      label="Port"
      variant="outlined"
      type="number"
      inputProps={{
        min: 1,
        max: 65535,
        step: 1,
      }}
    />
  );
}
