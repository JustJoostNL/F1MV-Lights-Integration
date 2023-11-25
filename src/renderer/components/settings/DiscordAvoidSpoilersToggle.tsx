import React, { useCallback } from "react";
import { Switch } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function DiscordAvoidSpoilersToggle() {
  const { config, updateConfig } = useConfig();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateConfig({
        discordRPCAvoidSpoilers: event.currentTarget.checked,
      });
    },
    [updateConfig],
  );

  return (
    <Switch checked={config.discordRPCAvoidSpoilers} onChange={handleChange} />
  );
}
