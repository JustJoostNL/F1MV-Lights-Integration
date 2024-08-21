import React, { useCallback } from "react";
import { Switch } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function HomebridgeEnabledToggle() {
  const { config, updateConfig } = useConfig();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateConfig({
        homebridgeEnabled: event.currentTarget.checked,
      });
    },
    [updateConfig],
  );

  return <Switch checked={config.homebridgeEnabled} onChange={handleChange} />;
}
