import React from "react";
import { Container } from "@mui/material";
import { ContentLayout } from "../components/layouts/ContentLayout";
import { Settings } from "../components/settings/Settings";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function Settingspage() {
  useDocumentTitle("F1MV Lights Integration - Settings");
  return (
    <ContentLayout container title="Settings">
      <Container
        sx={{
          mt: 3,
        }}
      >
        <Settings />
      </Container>
    </ContentLayout>
  );
}
