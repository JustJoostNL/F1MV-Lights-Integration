import NavBar from "@/components/navbar";
import SimulationMenu from "@/components/simulations";
import { Box, Typography } from "@mui/material";
import QuickAccessButtons from "@/components/quick-access-buttons";
import ReactGA from "react-ga4";

export default function Main() {
  ReactGA.send({ hitType: "pageview", page: "/home" });
  window.f1mvli.utils.changeWindowTitle("F1MV-Lights-Integration");

  return (
    <div>
      <NavBar showBackButton={false} />
      <Box sx={{ flexGrow: 1, textAlign: "center", mt: 10 }}>
        <Typography variant="h4" component="div" sx={{ fontSize: "2.5rem" }}>
					F1MV Lights Integration
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1, textAlign: "center", mt: 10 }}>
        <QuickAccessButtons />
      </Box>
      <Box sx={{ flexGrow: 1, textAlign: "center", mt: 10 }}>
        <SimulationMenu />
      </Box>
    </div>
  );
}