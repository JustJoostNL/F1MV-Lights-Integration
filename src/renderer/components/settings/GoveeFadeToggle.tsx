import React, { useCallback } from "react";
import { Switch } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function GoveeFadeToggle() {
  const { config, updateConfig } = useConfig();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateConfig({
        goveeFadeEnabled: event.currentTarget.checked,
      });
    },
    [updateConfig],
  );

  return <Switch checked={config.goveeFadeEnabled} onChange={handleChange} />;
}
