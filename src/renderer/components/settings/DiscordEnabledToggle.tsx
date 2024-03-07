import React, { useCallback } from "react";
import { Switch } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function DiscordEnabledToggle() {
  const { config, updateConfig } = useConfig();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateConfig({
        discordRPCEnabled: event.currentTarget.checked,
      });
    },
    [updateConfig],
  );

  return <Switch checked={config.discordRPCEnabled} onChange={handleChange} />;
}
