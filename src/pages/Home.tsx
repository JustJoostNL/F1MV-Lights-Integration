import { Box, Container, Typography, Alert, Button, Snackbar, IconButton, SnackbarCloseReason } from "@mui/material";
import ReactGA from "react-ga4";
import CloseIcon from "@mui/icons-material/Close";
import NavBar from "@/components/navbar";
import QuickAccessButtons from "@/components/quick-access-buttons";
import SimulationMenu from "@/components/simulations";
import IntegrationStatesTable from "@/components/integration-states";
import Paper from "@mui/material/Paper";
import { SyntheticEvent, useEffect, useState } from "react";
import { handleDownloadUpdateManually } from "@/pages/Update";
import { shell } from "electron";

export default function Main() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateAvailableSnackBarOpen, setUpdateAvailableSnackBarOpen] = useState(true);
  const [updateInfo, setUpdateInfo] = useState({} as any);
  ReactGA.send({ hitType: "pageview", page: "/home" });
  window.f1mvli.utils.changeWindowTitle("F1MV Lights Integration");

  setTimeout(() => {
    ReactGA.event({
      category: "app",
      action: "user_still_active",
    });
  }, 60000); // every minute send a user still active event

  const handleUpdateAvailableSnackBarClose = (event: Event | SyntheticEvent<any, Event>, reason?: SnackbarCloseReason) => {
    if (reason === "clickaway") return;
    setUpdateAvailableSnackBarOpen(false);
  };

  const handleOpenReleaseNotes = () => {
    shell.openExternal("https://github.com/JustJoostNL/F1MV-Lights-Integration/releases/latest");
  };

  const downloadUpdateAction = (
    <>
      <Button onClick={handleOpenReleaseNotes} sx={{ mr: 2 }} color="secondary" variant="text" size="small">
        Release Notes
      </Button>
      <Button onClick={handleDownloadUpdateManually} color="secondary" variant="contained" size="small">
        Download Update
      </Button>
      <IconButton
        size="small"
        sx={{ ml: 2 }}
        aria-label="close"
        color="inherit"
        onClick={handleUpdateAvailableSnackBarClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );

  useEffect(() => {
    async function getUpdateInfo() {
      const updateInfo = await window.f1mvli.updater.getUpdateAvailable();
      setUpdateInfo(updateInfo);
      setUpdateAvailable(updateInfo.updateAvailable);
    }
    getUpdateInfo();
  }, []);


  return (
    <>
      <NavBar showBackButton={false} />
      {updateAvailable && (
        <Snackbar open={updateAvailableSnackBarOpen} onClose={handleUpdateAvailableSnackBarClose}>
          <Alert
            action={downloadUpdateAction}
            sx={{
              width: "100%",
            }}
            onClose={() => setUpdateAvailableSnackBarOpen(false)}
            severity="info"
          >
            <b>Update available:</b> You currently have version {updateInfo.currentVersion} installed, version {updateInfo.newVersion} is available.
          </Alert>
        </Snackbar>
      )}
      <Container sx={{ flexGrow: 1, textAlign: "center", my: 10 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" sx={{ fontSize: "3rem", mb: 2 }}>
            F1MV Lights Integration
          </Typography>
          <Typography variant="h4" component="h2" sx={{ fontSize: "1.2rem", mb: 3, color: "grey.400" }}>
            The best way to connect your smart home lights MultiViewer.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <QuickAccessButtons />
          <SimulationMenu />
        </Box>
        <Paper sx={{
          width: "100%",
          mt: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <IntegrationStatesTable />
        </Paper>
      </Container>
    </>
  );
}