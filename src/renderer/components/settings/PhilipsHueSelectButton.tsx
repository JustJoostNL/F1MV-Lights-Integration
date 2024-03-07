import React from "react";
import { Button, Stack } from "@mui/material";

export function PhilipsHueSelectButton() {
  return (
    <Stack spacing={2} direction="row">
      <Button variant="outlined" href="#/philips-hue-ds">
        Select Devices
      </Button>
      <Button variant="outlined" href="#/philips-hue-gs">
        Select Groups
      </Button>
    </Stack>
  );
}
