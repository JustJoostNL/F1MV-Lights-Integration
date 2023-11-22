import React, { useCallback } from "react";
import { TextField } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function MultiViewerLiveTimingUrlInput() {
  const { config, updateConfig } = useConfig();

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      await updateConfig({ multiviewerLiveTimingURL: value });
    },
    [updateConfig],
  );

  return (
    <TextField
      value={config.multiviewerLiveTimingURL}
      onChange={handleInputChange}
      placeholder="e.g. http://localhost:10101"
      variant="outlined"
    />
  );
}
