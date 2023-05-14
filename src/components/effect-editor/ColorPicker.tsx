import { IColorPickerProps } from "@/components/effect-editor/types";
import React, { useState } from "react";
import { RgbColorPicker } from "react-colorful";

export function ColorPicker({ color, onChange, sx }: IColorPickerProps) {
  const [currentColor, setCurrentColor] = useState<any>(color);

  const handleChangeComplete = (newColor: any) => {
    setCurrentColor(newColor);
    onChange(newColor);
  };

  return (
    <div style={sx}>
      <RgbColorPicker color={currentColor} onChange={handleChangeComplete} />
    </div>
  );
}