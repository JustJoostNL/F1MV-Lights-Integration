import React, { useCallback } from "react";
import { TextField } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function DirigeraHubIpInput() {
  const { config, updateConfig } = useConfig();

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value === "" ? undefined : event.target.value;
      updateConfig({ dirigeraHubIp: value });
    },
    [updateConfig],
  );

  return (
    <TextField
      defaultValue={config.dirigeraHubIp}
      onChange={handleInputChange}
      label="IP Address or Hostname"
      variant="outlined"
    />
  );
}
