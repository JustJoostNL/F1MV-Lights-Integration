import React, { useCallback } from "react";
import { Switch } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function AutoTurnOffLightsToggle() {
  const { config, updateConfig } = useConfig();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateConfig({
        autoTurnOffLightsWhenSessionEnds: event.currentTarget.checked,
      });
    },
    [updateConfig],
  );

  return (
    <Switch
      checked={config.autoTurnOffLightsWhenSessionEnds}
      onChange={handleChange}
    />
  );
}
