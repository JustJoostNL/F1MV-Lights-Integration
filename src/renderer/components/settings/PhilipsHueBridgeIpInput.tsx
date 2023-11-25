import React, { useCallback } from "react";
import { TextField } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function PhilipsHueBridgeIpInput() {
  const { config, updateConfig } = useConfig();

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value === "" ? undefined : event.target.value;
      await updateConfig({ philipsHueBridgeIP: value });
    },
    [updateConfig],
  );

  return (
    <TextField
      defaultValue={config.philipsHueBridgeIP}
      onChange={handleInputChange}
      label="Bridge IP"
      variant="outlined"
    />
  );
}
