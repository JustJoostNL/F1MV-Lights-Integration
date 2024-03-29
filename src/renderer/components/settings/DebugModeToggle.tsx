import React, { useCallback } from "react";
import { Switch } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function DebugModeToggle() {
  const { config, updateConfig } = useConfig();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateConfig({
        debugMode: event.currentTarget.checked,
      });
    },
    [updateConfig],
  );

  return <Switch checked={config.debugMode} onChange={handleChange} />;
}
