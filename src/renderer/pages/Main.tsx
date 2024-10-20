import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  Stack,
  Typography,
  styled,
} from "@mui/material";
import log from "electron-log";
import { ipcRenderer, shell } from "electron";
import { ErrorOutlineRounded } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useHotkeys } from "react-hotkeys-hook";
import { theme } from "../lib/theme";

const Container = styled("div")({
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  gap: theme.spacing(2),
});

const Content = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  padding: theme.spacing(2),
  gap: theme.spacing(4),
});

const handleDownloadUpdateManually = () => {
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

export function IndexPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [doneChecking, setDoneChecking] = useState(false);
  const [updateError, setUpdateError] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (process.env.VITE_DEV_SERVER_URL) {
      log.transports.console.level = "debug";
    } else {
      log.transports.console.level = false;
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await window.f1mvli.updater.checkForUpdates();
        const isAvailable = await window.f1mvli.updater.getUpdateAvailable();
        setUpdating(isAvailable);
        setDoneChecking(true);
        setLoading(false);
      } catch (error: any) {
        setUpdateError(error);
        setDoneChecking(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!updating && !doneChecking) return;

    const handleInstallUpdate = async () => {
      await window.f1mvli.updater.quitAndInstall().catch((error) => {
        setUpdateError(error);
      });
    };

    const handleUpdateError = () => {
      setUpdateError(true);
      setUpdating(false);
    };

    ipcRenderer.on("update-downloaded", handleInstallUpdate);
    ipcRenderer.on("update-error", handleUpdateError);

    return () => {
      ipcRenderer.removeListener("update-downloaded", handleInstallUpdate);
    };
  }, [updating, doneChecking]);

  const handleContinue = useCallback(() => {
    navigate("/home");
  }, [navigate]);

  useHotkeys("shift+s", handleContinue);

  useEffect(() => {
    if (!updating && doneChecking) {
      setLoading(false);
      if (!updateError) {
        navigate("/home");
      }
    }
  }, [updating, doneChecking, navigate, updateError]);

  return (
    <Container>
      <Content>
        {!updateError && <CircularProgress />}
        {updateError && <ErrorOutlineRounded color="warning" />}
        <Typography>
          {loading || !doneChecking
            ? "Checking for updates..."
            : updating
              ? "Installing update..."
              : updateError
                ? "Failed to automatically update, please download the latest version manually."
                : ""}
        </Typography>
        {!updating && updateError && (
          <Stack direction="row" gap={2}>
            <Button onClick={handleContinue}>
              Continue with outdated version
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownloadUpdateManually}
            >
              Download update
            </Button>
          </Stack>
        )}
        {updating && (
          <Button onClick={handleContinue} sx={{ mt: 2 }}>
            Skip checking for updates
          </Button>
        )}
      </Content>
    </Container>
  );
}
