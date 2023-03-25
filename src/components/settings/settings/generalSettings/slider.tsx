import * as React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

interface BrightnessSliderProps {
	id: string;
	value: number;
}

export function BrightnessSlider({ id, value }: BrightnessSliderProps) {
	return (
		<Box width={300}>
			<Slider
				id={id}
				color="secondary"
				defaultValue={value}
				aria-label="Default"
				valueLabelDisplay="auto"
			/>
		</Box>
	);
}
