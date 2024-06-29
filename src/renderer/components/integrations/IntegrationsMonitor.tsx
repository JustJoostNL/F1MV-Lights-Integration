import React, { useCallback, useState } from "react";
import {
  Card,
  CardActionArea,
  CardHeader,
  CircularProgress,
  Collapse,
  Divider,
  List,
} from "@mui/material";
import {
  KeyboardArrowUpRounded,
  KeyboardArrowDownRounded,
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
  f1tvLiveSession: "F1TV Live Session Found",
  autoUpdater: "Auto Updater",
  webserver: "Webserver",
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
            ?.filter(
              (integrationState: IntegrationState) =>
                !integrationState.disabled,
            )
            .map((integrationState: IntegrationState) => (
              <div key={integrationState.name}>
                <Divider />
                <CardHeader
                  title={integrationStateMap[integrationState.name]}
                  action={
                    <div
                      className={`status ${integrationState.state ? "success" : "error"
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
          {integrationStates?.length === 0 && (
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
          )}
        </List>
      </Collapse>
    </Card>
  );
}
