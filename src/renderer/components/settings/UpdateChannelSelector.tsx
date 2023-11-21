import React, { useCallback } from "react";
import { Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function UpdateChannelSelector() {
  const { config, updateConfig } = useConfig();

  const handleUpdateChannelChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      updateConfig({
        updateChannel: event.target.value,
      });
    },
    [updateConfig],
  );

  return (
    <Select
      value={config.updateChannel}
      onChange={handleUpdateChannelChange}
      sx={{ minWidth: 150 }}
    >
      <MenuItem value="latest">Latest</MenuItem>
      <MenuItem value="beta">Beta</MenuItem>
      <MenuItem value="alpha">Alpha</MenuItem>
    </Select>
  );
}
