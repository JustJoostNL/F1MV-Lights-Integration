import { Box, Slider, Input } from "@mui/material";
import React, { useCallback } from "react";

interface BrightnessSliderProps {
  value: number;
  onChange: (newValue: number) => void;
}

export function BrightnessSlider({ value, onChange }: BrightnessSliderProps) {
  const handleSliderChange = useCallback(
    async (_event: Event, value: number | number[]) => {
      if (typeof value !== "number") return;
      onChange(value as number);
    },
    [onChange],
  );

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      onChange(Number(value));
    },
    [onChange],
  );

  return (
    <Box display="flex" alignItems="center" sx={{ width: 300 }}>
      <Box sx={{ m: 1, width: "100%" }}>
        <Slider
          value={value}
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
        value={value}
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
