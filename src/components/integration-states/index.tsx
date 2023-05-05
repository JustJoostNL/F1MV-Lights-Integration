import React, {useEffect, useState} from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import {IntegrationState, IntegrationStatesMap} from "@/components/integration-states/types";
import "./status.css";


const integrationStateMap: IntegrationStatesMap = {
  ikea: "IKEA",
  govee: "Govee",
  hue: "Philips Hue",
  openRGB: "OpenRGB",
  homeAssistant: "Home Assistant",
  yeelight: "Yeelight",
  streamDeck: "Stream Deck",
  nanoLeaf: "Nanoleaf",
  WLED: "WLED",
  F1MV: "MultiViewer",
  F1TVLiveSession: "Live Session Check",
  update: "Update",
  webServer: "Webserver",
}

export default function IntegrationStatesTable() {
  const [integrationStates, setIntegrationStates] = useState([]);
  const [config, setConfig] = useState<any | null>(null);

  useEffect(() => {
    async function fetchIntegrationStates() {
      const integrationStates = await window.f1mvli.utils.getStates();
      setIntegrationStates(integrationStates);
    }

    fetchIntegrationStates();
    setTimeout(() => {
      fetchIntegrationStates();
    }, 5000);
  }, []);

  useEffect(() => {
    async function fetchConfig() {
      const config = await window.f1mvli.config.getAll();
      setConfig(config);
    }
    fetchConfig();
    setTimeout(() => {
      fetchConfig();
    }, 5000);
  }, []);

  return (
    <TableContainer sx={{
      maxHeight: 300
    }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Integration</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {integrationStates.filter((integrationState: IntegrationState) => {
            return !integrationState.disabled;
          }).map((integrationState: IntegrationState) => {
            return (
              <TableRow key={integrationState.name}>
                {/* @ts-ignore */}
                <TableCell>{integrationStateMap[integrationState.name]}</TableCell>
                <TableCell sx={{ alignItems: "center" }}>
                  <div className={`status ${integrationState.state ? "success" : "error"}`}>
                    &nbsp;
                  </div>
                </TableCell>
              </TableRow>
            );
          })
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
}