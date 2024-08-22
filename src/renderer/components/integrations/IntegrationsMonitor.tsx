import React, { useCallback, useState } from "react";
import {
  Card,
  CardActionArea,
  CardHeader,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  List,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  KeyboardArrowUpRounded,
  KeyboardArrowDownRounded,
  InfoRounded,
} from "@mui/icons-material";
import useSWR from "swr";
import { IntegrationState } from "./types";
import "./status.css";

const integrationStateMap: {
  [key: string]: string;
} = {
  tradfri: "IKEA Tradfri",
  govee: "Govee",
  philipsHue: "Philips Hue",
  openrgb: "OpenRGB",
  homeAssistant: "Home Assistant",
  homebridge: "Homebridge",
  streamdeck: "Elgato Stream Deck",
  wled: "WLED",
  mqtt: "MQTT",
  multiviewer: "MultiViewer Live Timing",
  f1tvLiveSession: "Live Session",
  webserver: "Webserver",
};

const integrationExplanationMap: {
  [key: string]: string;
} = {
  f1tvLiveSession:
    "This checks if there is a live session currently active on F1TV.",
};

async function fetchIntegrationStates() {
  return await window.f1mvli.utils.getIntegrationStates();
}

export function IntegrationsMonitor() {
  const [open, setOpen] = useState(true);

  const handleToggleOpen = useCallback(() => {
    setOpen(!open);
  }, [open]);

  const { data: integrationStates } = useSWR(
    "integrationStates",
    fetchIntegrationStates,
    {
      refreshInterval: 5000,
    },
  );

  const isLoading =
    !integrationStates ||
    integrationStates.length === 0 ||
    !Array.isArray(integrationStates);

  if (isLoading) {
    return (
      <Card
        sx={{
          width: "70%",
        }}
      >
        <CardActionArea onClick={handleToggleOpen}>
          <CardHeader
            title="Integration States"
            action={<KeyboardArrowDownRounded />}
            sx={{
              "& .MuiCardHeader-action": {
                mt: 0,
                mr: 0,
                mb: 0,
                alignSelf: "center",
              },
            }}
          />
        </CardActionArea>

        <Collapse in={open}>
          <Divider />
          <List disablePadding>
            <div
              style={{
                display: "grid",
                placeItems: "center",
                placeContent: "center",
                height: 80,
              }}
            >
              <CircularProgress />
            </div>
          </List>
        </Collapse>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        width: "70%",
      }}
    >
      <CardActionArea onClick={handleToggleOpen}>
        <CardHeader
          title="Integration States"
          action={
            open ? <KeyboardArrowUpRounded /> : <KeyboardArrowDownRounded />
          }
          sx={{
            "& .MuiCardHeader-action": {
              mt: 0,
              mr: 0,
              mb: 0,
              alignSelf: "center",
            },
          }}
        />
      </CardActionArea>

      <Collapse in={open}>
        <Divider />

        <List disablePadding>
          {integrationStates
            .filter(
              (integrationState: IntegrationState) =>
                !integrationState.disabled,
            )
            .map((integrationState: IntegrationState) => (
              <div key={integrationState.name}>
                <Divider />
                <CardHeader
                  title={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography fontSize={18} fontWeight="500">
                        {integrationStateMap[integrationState.name]}
                      </Typography>

                      {integrationExplanationMap[integrationState.name] && (
                        <Tooltip
                          arrow
                          title={
                            integrationExplanationMap[integrationState.name]
                          }
                        >
                          <IconButton size="medium" sx={{ padding: 0 }}>
                            <InfoRounded color="primary" fontSize="medium" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  }
                  action={
                    <div
                      className={`status ${
                        integrationState.state ? "success" : "error"
                      }`}
                    ></div>
                  }
                  sx={{
                    "& .MuiCardHeader-action": {
                      mt: 0,
                      mr: 0,
                      mb: 0,
                      alignSelf: "center",
                    },
                  }}
                />
              </div>
            ))}
        </List>
      </Collapse>
    </Card>
  );
}
