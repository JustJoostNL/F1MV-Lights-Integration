import React, { useCallback } from "react";
import { TextField } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function HomebridgeServerUsername() {
  const { config, updateConfig } = useConfig();

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value === "" ? undefined : event.target.value;
      updateConfig({ homebridgeUsername: value });
    },
    [updateConfig],
  );

  return (
    <TextField
      defaultValue={config.homebridgeUsername}
      onChange={handleInputChange}
      label="Username"
      variant="outlined"
    />
  );
}
