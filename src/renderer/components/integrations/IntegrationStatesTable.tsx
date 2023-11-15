import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { IntegrationState, IntegrationStatesMap } from "./types";
import "./status.css";

const integrationStateMap: IntegrationStatesMap = {
  ikea: "IKEA",
  govee: "Govee",
  hue: "Philips Hue",
  openRGB: "OpenRGB",
  homeAssistant: "Home Assistant",
  streamDeck: "Stream Deck",
  WLED: "WLED",
  MQTT: "MQTT",
  F1MV: "MultiViewer",
  F1TVLiveSession: "F1TV Live Session Found",
  update: "Auto Updater",
  webServer: "Webserver",
};

export function IntegrationStatesTable() {
  const [integrationStates, setIntegrationStates] = useState<
    IntegrationState[]
  >([]);

  useEffect(() => {
    async function fetchIntegrationStates() {
      const newIntegrationStates =
        await window.f1mvli.utils.getIntegrationStates();
      setIntegrationStates([...newIntegrationStates]);
    }

    fetchIntegrationStates();
    const intervalId = setInterval(fetchIntegrationStates, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <TableContainer sx={{ maxHeight: 300 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Integration</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {integrationStates
            .filter(
              (integrationState: IntegrationState) =>
                !integrationState.disabled,
            )
            .map((integrationState: IntegrationState) => (
              <TableRow key={integrationState.name}>
                <TableCell>
                  {integrationStateMap[integrationState.name]}
                </TableCell>
                <TableCell sx={{ alignItems: "center" }}>
                  <div
                    className={`status ${
                      integrationState.state ? "success" : "error"
                    }`}
                  ></div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
