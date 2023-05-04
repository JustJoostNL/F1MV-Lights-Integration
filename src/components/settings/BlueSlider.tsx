import React from "react";
import Box from "@mui/material/Box";
import MuiInput from "@mui/material/Input";
import Slider from "@mui/material/Slider";

interface BlueSliderProps {
  id: string;
  value: number;
  onChange?: (event: any, value: number | number[] | "", activeThumb: number) => void;
}

export function BlueSlider({ id, value, onChange }: BlueSliderProps) {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange && onChange(event, event.target.value === "" ? "" : Number(event.target.value), -1);
  };

  const handleBlur = () => {
    if (value < 0) {
      onChange && onChange(null, 0, -1);
    } else if (value > 100) {
      onChange && onChange(null, 100, -1);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", width: 400 }}>
      <Box sx={{ m: 1, width: "100%" }}>
        <Slider
          id={id}
          color="secondary"
          value={value}
          aria-label="Default"
          valueLabelDisplay="auto"
          onChange={onChange}
        />
      </Box>
      <MuiInput
        value={value}
        size="small"
        onChange={handleInputChange}
        onBlur={handleBlur}
        inputProps={{
          step: 1,
          min: 0,
          max: 100,
          type: "number",
          "aria-labelledby": "input-slider",
        }}
        sx={{ width: 70, ml: 2, mr: 1, textAlign: "center" }}
      />
    </Box>
  );
}