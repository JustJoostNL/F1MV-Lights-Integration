import { Box, Container, Typography } from "@mui/material";
import ReactGA from "react-ga4";
import NavBar from "@/components/navbar";
import QuickAccessButtons from "@/components/quick-access-buttons";
import SimulationMenu from "@/components/simulations";

export default function Main() {
  ReactGA.send({ hitType: "pageview", page: "/home" });
  window.f1mvli.utils.changeWindowTitle("F1MV-Lights-Integration");

  return (
    <>
      <NavBar showBackButton={false} />
      <Container sx={{ flexGrow: 1, textAlign: "center", my: 10 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" sx={{ fontSize: "3rem", mb: 2 }}>
            F1MV-Lights-Integration
          </Typography>
          <Typography variant="h4" component="h2" sx={{ fontSize: "1.2rem", mb: 3, color: "grey.400" }}>
            The best way to connect your smart home lights to a Formula 1 session.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <QuickAccessButtons />
          <SimulationMenu />
        </Box>
      </Container>
    </>
  );
}