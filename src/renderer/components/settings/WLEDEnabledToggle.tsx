import React, { useCallback } from "react";
import { Switch } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function WLEDEnabledToggle() {
  const { config, updateConfig } = useConfig();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateConfig({
        wledEnabled: event.currentTarget.checked,
      });
    },
    [updateConfig],
  );

  return <Switch checked={config.wledEnabled} onChange={handleChange} />;
}
