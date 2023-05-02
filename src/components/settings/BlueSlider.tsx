import * as React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

interface BlueSliderProps {
	id: string;
	value: number;
	onChange?: (event: any, value: number | number[], activeThumb: number) => void;
}

export function BlueSlider({ id, value, onChange }: BlueSliderProps) {
  return (
    <Box width={300}>
      <Slider
        id={id}
        color="secondary"
        value={value}
        aria-label="Default"
        valueLabelDisplay="auto"
        onChange={onChange}
      />
    </Box>
  );
}
