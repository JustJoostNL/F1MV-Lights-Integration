import React from "react";
import { Container } from "@mui/material";
import { useHotkeys } from "react-hotkeys-hook";
import { ContentLayout } from "../components/layouts/ContentLayout";
import { Settings } from "../components/settings/Settings";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function SettingsPage() {
  useDocumentTitle("F1MV Lights Integration - Settings");

  useHotkeys("shift+o", () => {
    window.f1mvli.config.open();
  });

  return (
    <ContentLayout title="Settings" hideTitle>
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
