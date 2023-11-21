import React, { useCallback } from "react";
import { Box, Input, Slider } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";

export function GoBackToStaticBrightnessSlider() {
  const { config, updateConfig } = useConfig();

  const handleSliderChange = useCallback(
    async (_event: Event, value: number | number[]) => {
      if (typeof value !== "number") return;
      await updateConfig({ staticBrightness: value as number });
    },
    [updateConfig],
  );

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      await updateConfig({ staticBrightness: Number(value) });
    },
    [updateConfig],
  );

  return (
    <Box display="flex" alignItems="center" sx={{ width: 300 }}>
      <Box sx={{ m: 1, width: "100%" }}>
        <Slider
          value={config.staticBrightness}
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
        value={config.staticBrightness}
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
