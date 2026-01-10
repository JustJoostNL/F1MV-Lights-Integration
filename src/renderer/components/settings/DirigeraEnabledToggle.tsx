import React, { useCallback } from "react";
import { Switch } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function DirigeraEnabledToggle() {
  const { config, updateConfig } = useConfig();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateConfig({
        dirigeraEnabled: event.currentTarget.checked,
      });
    },
    [updateConfig],
  );

  return <Switch checked={config.dirigeraEnabled} onChange={handleChange} />;
}
