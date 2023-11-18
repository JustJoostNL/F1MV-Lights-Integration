import React, { useMemo, useState, useCallback } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  styled,
} from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import LoadingButton from "@mui/lab/LoadingButton";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import swr from "swr";
import { shell } from "electron";
import semver from "semver";
import { DonateButton } from "../shared/DonateButton";

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

// var shell = require('electron').shell;
// //open links externally by default
// $(document).on('click', 'a[href^="http"]', function(event) {
//     event.preventDefault();
//     shell.openExternal(this.href);
// });

const StyledReactMarkdown = styled(ReactMarkdown)(({ theme }) => ({
  "& p": {
    margin: theme.spacing(1, 0),
  },
  "& ul, & ol": {
    margin: 0,
    paddingLeft: theme.spacing(3),
  },
  "& a": {
    color: theme.palette.primary.main,
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  "& blockquote": {
    margin: theme.spacing(1, 0),
    padding: theme.spacing(1, 2),
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    borderRadius: theme.shape.borderRadius,
    "& p": {
      margin: 0,
    },
  },
}));

export const UpdateMonitor = ({
  disableGutters = false,
}: {
  disableGutters?: boolean;
}) => {
  const [updating, setUpdating] = useState(false);
  const [releaseNotesOpen, setReleaseNotesOpen] = useState(false);
  const [supportsAutoUpdate, setSupportsAutoUpdate] = useState(true);

  const appVersion = swr("appVersion", async () => {
    return await window.f1mvli.appInfo.getAppVersion();
  }).data;

  const data = swr(
    "update-info",
    async () => {
      const releaseInfo = await window.f1mvli.updater.checkForUpdates();
      return releaseInfo.updateInfo;
    },
    { refreshInterval: 1000 * 60 * 15 }, // 15 minutes
  ).data;

  const latestVersion = data?.version;

  const isUpdateAvailable = useMemo(() => {
    return (
      data &&
      latestVersion &&
      appVersion &&
      semver.gt(latestVersion, appVersion)
    );
  }, [data, latestVersion, appVersion]);

  const handleReleaseNotesClose = useCallback(() => {
    setReleaseNotesOpen(false);
  }, []);

  const handleShowReleaseNotesClick = useCallback(() => {
    setReleaseNotesOpen(true);
  }, []);

  const handleUpdateAndRestartClick = useCallback(async () => {
    try {
      setUpdating(true);

      await window.f1mvli.updater.quitAndInstall();
    } catch (error) {
      alert(`Failed to download update: ${error.toString()}`);
      setSupportsAutoUpdate(false);
    } finally {
      setUpdating(false);
    }
  }, []);

  if (!isUpdateAvailable) return null;

  return (
    <>
      <Alert
        variant="filled"
        color="info"
        icon={false}
        sx={{
          m: disableGutters ? 0 : 2,
          my: 2,
          alignItems: "center",
          "& .MuiAlert-action": {
            p: 0.5,
          },
        }}
        action={
          <Stack direction="row" gap={2}>
            <Button color="inherit" onClick={handleShowReleaseNotesClick}>
              Release notes
            </Button>
            {supportsAutoUpdate ? (
              <LoadingButton
                variant="outlined"
                color="inherit"
                loading={updating}
                onClick={handleUpdateAndRestartClick}
              >
                Update and restart
              </LoadingButton>
            ) : (
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleDownloadUpdateManually}
              >
                Download update
              </Button>
            )}
          </Stack>
        }
      >
        <strong>Update available:</strong> You currently have version v
        {appVersion} installed, but v{latestVersion} is available.
      </Alert>
      <Dialog
        maxWidth="sm"
        open={releaseNotesOpen}
        onClose={handleReleaseNotesClose}
        fullWidth
      >
        <DialogTitle>Release notes for {latestVersion}</DialogTitle>
        <Alert
          icon={false}
          variant="standard"
          sx={{
            fontWeight: 600,
            alignItems: "center",
            borderRadius: 0,
            px: 3,
            "& .MuiAlert-action": {
              p: 0.5,
            },
          }}
          action={<DonateButton />}
        >
          If you like the app, consider donating 💚
        </Alert>
        <DialogContent>
          <StyledReactMarkdown
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
          >
            {(data?.releaseNotes as unknown as string) || ""}
          </StyledReactMarkdown>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" gap={1}>
            <Button color="error" onClick={handleReleaseNotesClose}>
              Cancel
            </Button>
            <Button
              onClick={handleReleaseNotesClose}
              href="https://github.com/JustJoostNL/F1MV-Lights-Integration/releases/latest"
              target="_blank"
            >
              Read changelog
            </Button>
            {supportsAutoUpdate ? (
              <LoadingButton
                variant="outlined"
                color="inherit"
                loading={updating}
                onClick={handleUpdateAndRestartClick}
                endIcon={<DownloadRoundedIcon />}
              >
                Update and restart
              </LoadingButton>
            ) : (
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleDownloadUpdateManually}
                endIcon={<DownloadRoundedIcon />}
              >
                Download update
              </Button>
            )}
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
};
