import React, { useCallback } from "react";
import { TextField } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function HomebridgeServerPassword() {
  const { config, updateConfig } = useConfig();

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value === "" ? undefined : event.target.value;
      await updateConfig({ homebridgePassword: value });
    },
    [updateConfig],
  );

  return (
    <TextField
      defaultValue={config.homebridgePassword}
      onChange={handleInputChange}
      label="Password"
      variant="outlined"
    />
  );
}
