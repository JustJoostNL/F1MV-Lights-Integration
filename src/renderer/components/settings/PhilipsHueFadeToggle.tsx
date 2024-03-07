import React, { useCallback } from "react";
import { Switch } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function PhilipsHueFadeToggle() {
  const { config, updateConfig } = useConfig();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateConfig({
        philipsHueEnableFade: event.currentTarget.checked,
      });
    },
    [updateConfig],
  );

  return (
    <Switch checked={config.philipsHueEnableFade} onChange={handleChange} />
  );
}
