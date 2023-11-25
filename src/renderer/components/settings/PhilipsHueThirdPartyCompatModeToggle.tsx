import React, { useCallback } from "react";
import { Switch } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function PhilipsHueThirdPartyCompatiblityModeToggle() {
  const { config, updateConfig } = useConfig();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateConfig({
        philipsHueThirdPartyCompatiblityMode: event.currentTarget.checked,
      });
    },
    [updateConfig],
  );

  return (
    <Switch
      checked={config.philipsHueThirdPartyCompatiblityMode}
      onChange={handleChange}
    />
  );
}
