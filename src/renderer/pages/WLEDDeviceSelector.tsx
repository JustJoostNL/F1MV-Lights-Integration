import React, { useCallback, useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useConfig } from "../hooks/useConfig";
import { ContentLayout } from "../components/layouts/ContentLayout";

export function WLEDDeviceSelector() {
  const { config, updateConfig } = useConfig();
  const [inputValue, setInputValue] = useState("");
  const alreadySelectedDevices = config.wledDevices;

  const handleAddDevice = useCallback(
    (deviceIp: string) => {
      updateConfig({
        wledDevices: [...alreadySelectedDevices, deviceIp],
      });
    },
    [alreadySelectedDevices, updateConfig],
  );

  const handleRemoveDevice = useCallback(
    (deviceIp: string) => {
      updateConfig({
        wledDevices: alreadySelectedDevices.filter((ip) => ip !== deviceIp),
      });
    },
    [alreadySelectedDevices, updateConfig],
  );

  const isValidDevice = useCallback(
    (deviceIp: string) => {
      return (
        deviceIp.match(/^(?:(?:[a-zA-Z0-9-]+)\.){1,3}(?:[a-zA-Z0-9]+)$/) &&
        !alreadySelectedDevices.includes(deviceIp)
      );
    },
    [alreadySelectedDevices],
  );

  return (
    <ContentLayout title="Configure WLED Devices" titleVariant="h2" container>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        padding={2}
      >
        <Stack spacing={2} direction="row" alignItems="center">
          <TextField
            label="WLED Device IP/Hostname"
            error={(inputValue && !isValidDevice(inputValue)) as boolean}
            // helperText={
            //   (inputValue &&
            //     !isValidDevice(inputValue) &&
            //     "Invalid IP address/hostname or already added") ||
            //   undefined
            // } causes bug in button alignment
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isValidDevice(inputValue)) {
                handleAddDevice(inputValue);
                setInputValue("");
              }
            }}
          />

          <Button
            variant="contained"
            disabled={!isValidDevice(inputValue)}
            sx={{ alignSelf: "center" }}
            onClick={() => {
              if (isValidDevice(inputValue)) {
                handleAddDevice(inputValue);
                setInputValue("");
              }
            }}
          >
            Add
          </Button>
        </Stack>

        <Typography variant="h4" gutterBottom sx={{ marginTop: 5 }}>
          Added Devices
        </Typography>

        {alreadySelectedDevices.length === 0 && (
          <Typography variant="body1" gutterBottom color="text.secondary">
            No devices added
          </Typography>
        )}

        <Stack spacing={2}>
          {alreadySelectedDevices.map((deviceIp) => (
            <Box key={deviceIp} display="flex" justifyContent="space-between">
              <Typography
                variant="body1"
                sx={{ alignSelf: "center", overflow: "hidden", mr: 2 }}
              >
                {deviceIp}
              </Typography>
              <Button
                variant="contained"
                color="error"
                size="small"
                sx={{ height: "100%", alignSelf: "center" }}
                onClick={() => handleRemoveDevice(deviceIp)}
              >
                Remove
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
    </ContentLayout>
  );
}
