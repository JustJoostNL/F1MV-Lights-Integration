import { Box, Slider, Input } from "@mui/material";
import React, { useCallback } from "react";
import { useConfig } from "../../hooks/useConfig";

export function GlobalMaxBrightnessSlider() {
  const { config, updateConfig } = useConfig();

  const handleSliderChange = useCallback(
    async (_event: Event, value: number | number[]) => {
      if (typeof value !== "number") return;
      updateConfig({ globalMaxBrightness: value });
    },
    [updateConfig],
  );

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(event.target.value);
      if (isNaN(value)) return;
      updateConfig({ globalMaxBrightness: value });
    },
    [updateConfig],
  );

  return (
    <Box display="flex" alignItems="center" sx={{ width: 300 }}>
      <Box sx={{ m: 1, width: "100%" }}>
        <Slider
          value={config.globalMaxBrightness}
          onChange={handleSliderChange}
          min={0}
          max={100}
          step={1}
          valueLabelDisplay="auto"
          sx={{
            width: "100%",
          }}
        />
      </Box>
      <Input
        value={config.globalMaxBrightness}
        onChange={handleInputChange}
        size="small"
        type="number"
        inputProps={{
          min: 0,
          max: 100,
          step: 1,
          type: "number",
        }}
        sx={{ width: 55, ml: 3 }}
      />
    </Box>
  );
}
