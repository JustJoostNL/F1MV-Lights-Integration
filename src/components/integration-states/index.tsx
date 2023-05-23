import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  IntegrationState,
  IntegrationStatesMap,
} from "@/components/integration-states/types";
import "./status.css";

const integrationStateMap: IntegrationStatesMap = {
  ikea: "IKEA",
  govee: "Govee",
  hue: "Philips Hue",
  openRGB: "OpenRGB",
  homeAssistant: "Home Assistant",
  streamDeck: "Stream Deck",
  WLED: "WLED",
  F1MV: "MultiViewer",
  F1TVLiveSession: "F1 Live Session Found",
  update: "Auto Updater",
  webServer: "Webserver",
};

export default function IntegrationStatesTable() {
  const [integrationStates, setIntegrationStates] = useState<IntegrationState[]>([]);

  useEffect(() => {
    async function fetchIntegrationStates() {
      const newIntegrationStates = await window.f1mvli.utils.getStates();
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
              (integrationState: IntegrationState) => !integrationState.disabled
            )
            .map((integrationState: IntegrationState) => (
              <TableRow key={integrationState.name}>
                <TableCell>
                  {/*@ts-ignore*/}
                  {integrationStateMap[integrationState.name]}
                </TableCell>
                <TableCell sx={{ alignItems: "center" }}>
                  <div className={`status ${integrationState.state ? "success" : "error"}`}>

                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}