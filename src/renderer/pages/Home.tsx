import React, { useEffect, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import Paper from "@mui/material/Paper";
import { Navbar } from "../components/layouts/Navbar";
import { QuickAccessButtons } from "../components/home/QuickAccessButtons";
import { SimulationMenu } from "../components/home/SimulationMenu";
import { IntegrationStatesTable } from "../components/integrations/IntegrationStatesTable";
import { UpdateResult } from "../../shared/updater/UpdateResult";
import { UpdateMonitor } from "../components/layouts/UpdateMonitor";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function HomePage() {
  const [updateInformation, setUpdateInformation] =
    useState<UpdateResult | null>(null);

  //window.f1mvli.utils.changeWindowTitle("F1MV Lights Integration");
  useDocumentTitle("F1MV Lights Integration");

  useEffect(() => {
    (async () => {
      const updateInfo = await window.f1mvli.updater.getUpdateAvailable();
      setUpdateInformation(updateInfo);
    })();
  }, []);

  return (
    <>
      <Navbar hideBackButton />
      <Container sx={{ flexGrow: 1, textAlign: "center", my: 10 }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{ fontSize: "3rem", mb: 2 }}
          >
            F1MV Lights Integration
          </Typography>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontSize: "1.2rem", mb: 3, color: "grey.400" }}
          >
            The best way to connect your smart home lights to MultiViewer.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <QuickAccessButtons />
          <SimulationMenu />
        </Box>

        <Paper
          sx={{
            width: "100%",
            mt: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <IntegrationStatesTable />
        </Paper>

        {updateInformation?.updateAvailable && (
          <UpdateMonitor updateInformation={updateInformation} />
        )}
      </Container>
    </>
  );
}
