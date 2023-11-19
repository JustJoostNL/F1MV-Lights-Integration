import React, { useCallback } from "react";
import { Switch } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function MultiViewerSyncToggle() {
  const { config, updateConfig } = useConfig();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateConfig({
        multiviewerCheck: event.currentTarget.checked,
      });
    },
    [updateConfig],
  );

  return <Switch checked={config.multiviewerCheck} onChange={handleChange} />;
}
