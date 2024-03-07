import { Box, TextField } from "@mui/material";
import { RgbColorPicker } from "react-colorful";
import React from "react";

interface ColorSwatchProps {
  color: {
    r: number;
    g: number;
    b: number;
  };
  onChange?: (rgbColor: { r: number; g: number; b: number }) => void;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  onChange,
}) => {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
        }}
      >
        <RgbColorPicker
          draggable
          style={{ width: 260, height: 150, marginRight: 5 }}
          color={color}
          onChange={(color) => {
            if (onChange) {
              onChange(color);
            }
          }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            mt: 3,
          }}
        >
          <TextField
            label="Red"
            value={color.r}
            onChange={(event) => {
              if (onChange) {
                onChange({
                  r: Number(event.target.value),
                  g: color.g,
                  b: color.b,
                });
              }
            }}
            inputProps={{
              min: 0,
              max: 100,
              step: 1,
              type: "number",
            }}
            sx={{ width: 80, mr: 1 }}
          />
          <TextField
            label="Green"
            value={color.g}
            onChange={(event) => {
              if (onChange) {
                onChange({
                  r: color.r,
                  g: Number(event.target.value),
                  b: color.b,
                });
              }
            }}
            inputProps={{
              min: 0,
              max: 100,
              step: 1,
              type: "number",
            }}
            sx={{ width: 80 }}
          />
          <TextField
            label="Blue"
            value={color.b}
            onChange={(event) => {
              if (onChange) {
                onChange({
                  r: color.r,
                  g: color.g,
                  b: Number(event.target.value),
                });
              }
            }}
            inputProps={{
              min: 0,
              max: 100,
              step: 1,
              type: "number",
            }}
            sx={{ width: 80, ml: 1 }}
          />
        </Box>
      </Box>
    </>
  );
};
