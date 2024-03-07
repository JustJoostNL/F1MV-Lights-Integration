import React, { useCallback } from "react";
import { TextField } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function IkeaIdentityInput() {
  const { config, updateConfig } = useConfig();

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value === "" ? undefined : event.target.value;
      await updateConfig({ ikeaIdentity: value });
    },
    [updateConfig],
  );

  return (
    <TextField
      defaultValue={config.ikeaIdentity}
      onChange={handleInputChange}
      label="Identity"
      variant="outlined"
    />
  );
}
