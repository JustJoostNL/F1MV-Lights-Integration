import React, { useCallback } from "react";
import { Switch } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function DirigeraFadeToggle() {
  const { config, updateConfig } = useConfig();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateConfig({
        dirigeraFadeEnabled: event.currentTarget.checked,
      });
    },
    [updateConfig],
  );

  return (
    <Switch checked={config.dirigeraFadeEnabled} onChange={handleChange} />
  );
}
