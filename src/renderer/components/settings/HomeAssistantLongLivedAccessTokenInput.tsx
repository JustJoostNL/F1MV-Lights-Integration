import React, { useCallback } from "react";
import { TextField } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function HomeAssistantLongLivedAccessTokenInput() {
  const { config, updateConfig } = useConfig();

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value === "" ? undefined : event.target.value;
      await updateConfig({ homeAssistantToken: value });
    },
    [updateConfig],
  );

  return (
    <TextField
      defaultValue={config.homeAssistantToken}
      onChange={handleInputChange}
      label="Long-Lived Access Token"
      variant="outlined"
    />
  );
}
