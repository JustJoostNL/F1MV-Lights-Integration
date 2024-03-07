import React from "react";
import { Box, Typography } from "@mui/material";
import { IntegrationsMonitor } from "../components/integrations/IntegrationsMonitor";
import { UpdateMonitor } from "../components/layouts/UpdateMonitor";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { ContentLayout } from "../components/layouts/ContentLayout";
import { QuickAccessButtons } from "../components/home/QuickAccessButtons";

export function HomePage() {
  useDocumentTitle("F1MV Lights Integration");

  return (
    <ContentLayout container title="Home" hideTitle>
      <UpdateMonitor />
      <Box sx={{ mt: 10 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontSize: "3rem",
            mb: 1.5,
            textAlign: "center",
            fontWeight: 700,
          }}
        >
          F1MV Lights Integration
        </Typography>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontSize: "1.2rem",
            mb: 3,
            color: "grey.400",
            textAlign: "center",
          }}
        >
          The best way to connect your smart home lights to MultiViewer.
        </Typography>
      </Box>
      <QuickAccessButtons />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 5,
        }}
      >
        <IntegrationsMonitor />
      </Box>
    </ContentLayout>
  );
}
