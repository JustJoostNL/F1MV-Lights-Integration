import React from "react";
import { Alert, Stack, Button } from "@mui/material";
import { shell } from "electron";
import { UpdateResult } from "../../../shared/updater/UpdateResult";

interface UpdateMonitorProps {
  updateInformation: UpdateResult | null;
}

const handleOpenReleaseNotes = () => {
  shell.openExternal(
    "https://github.com/JustJoostNL/F1MV-Lights-Integration/releases/latest",
  );
};

export const handleDownloadUpdateManually = () => {
  switch (process.platform) {
    case "win32":
      shell.openExternal(
        "https://api.jstt.me/api/v2/f1mvli/download/latest/win",
      );
      break;
    case "darwin":
      if (process.arch === "arm64") {
        shell.openExternal(
          "https://api.jstt.me/api/v2/f1mvli/download/latest/mac-arm",
        );
      } else {
        shell.openExternal(
          "https://api.jstt.me/api/v2/f1mvli/download/latest/mac",
        );
      }
      break;
    case "linux":
      shell.openExternal(
        "https://api.jstt.me/api/v2/f1mvli/download/latest/linux",
      );
      break;
  }
};

export function UpdateMonitor({ updateInformation }: UpdateMonitorProps) {
  return (
    <>
      <Alert
        variant="filled"
        color="info"
        icon={false}
        sx={{
          m: 0,
          my: 2,
          alignItems: "center",
        }}
        action={
          <Stack direction="row" gap={2}>
            <Button
              variant="text"
              color="inherit"
              onClick={handleOpenReleaseNotes}
            >
              Release notes
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleDownloadUpdateManually}
            >
              Download update
            </Button>
          </Stack>
        }
      >
        <strong>Update available:</strong> You currently have version v
        {updateInformation?.currentVersion} installed, but{" "}
        {updateInformation?.newVersion} is available.
      </Alert>
    </>
  );
}
