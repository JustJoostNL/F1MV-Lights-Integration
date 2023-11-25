import React, { useCallback } from "react";
import { TextField } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function PhilipsHueBridgeTokenInput() {
  const { config, updateConfig } = useConfig();

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value === "" ? undefined : event.target.value;
      await updateConfig({ philipsHueToken: value });
    },
    [updateConfig],
  );

  return (
    <TextField
      defaultValue={config.philipsHueToken}
      onChange={handleInputChange}
      label="Bridge Token"
      variant="outlined"
    />
  );
}
