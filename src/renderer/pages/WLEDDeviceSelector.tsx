import React, { useCallback, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  InputAdornment,
  Alert,
} from "@mui/material";
import { AddRounded, DeleteRounded, DevicesRounded } from "@mui/icons-material";
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

  const handleSubmit = useCallback(() => {
    if (isValidDevice(inputValue)) {
      handleAddDevice(inputValue);
      setInputValue("");
    }
  }, [inputValue, isValidDevice, handleAddDevice]);

  return (
    <ContentLayout container title="" hideTitle>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          my: 2,
        }}
      >
        <TextField
          placeholder="Enter WLED device IP or hostname..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
          error={inputValue !== "" && !isValidDevice(inputValue)}
          helperText={
            inputValue !== "" && !isValidDevice(inputValue)
              ? "Invalid IP/hostname or already added"
              : " "
          }
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <DevicesRounded />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="contained"
                    disabled={!isValidDevice(inputValue)}
                    onClick={handleSubmit}
                    startIcon={<AddRounded />}
                  >
                    Add
                  </Button>
                </InputAdornment>
              ),
            },
          }}
          sx={{ maxWidth: 600 }}
        />

        {alreadySelectedDevices.length > 0 ? (
          <Paper elevation={2}>
            <List disablePadding>
              {alreadySelectedDevices.map((deviceIp, index) => (
                <ListItem
                  key={deviceIp}
                  divider={index < alreadySelectedDevices.length - 1}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemoveDevice(deviceIp)}
                      color="error"
                    >
                      <DeleteRounded />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={deviceIp}
                    slotProps={{
                      primary: {
                        fontFamily: "monospace",
                        fontSize: "0.95rem",
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        ) : (
          <Alert severity="info">
            No devices added yet. Enter an IP address or hostname above to add a
            WLED device.
          </Alert>
        )}
      </Box>
    </ContentLayout>
  );
}
