import React, { useCallback } from "react";
import { Switch } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function GoBackToStaticToggle() {
  const { config, updateConfig } = useConfig();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateConfig({
        goBackToStatic: event.currentTarget.checked,
      });
    },
    [updateConfig],
  );

  return <Switch checked={config.goBackToStatic} onChange={handleChange} />;
}
