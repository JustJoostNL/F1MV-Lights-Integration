import React, { useCallback } from "react";
import { Switch } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function AutoMultiViewerStartToggle() {
  const { config, updateConfig } = useConfig();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateConfig({
        startMultiViewerWhenAppStarts: event.currentTarget.checked,
      });
    },
    [updateConfig],
  );

  return (
    <Switch
      checked={config.startMultiViewerWhenAppStarts}
      onChange={handleChange}
    />
  );
}
