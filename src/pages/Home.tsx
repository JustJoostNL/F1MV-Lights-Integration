import NavBar from "@/components/navbar";
import SimulationMenu from "@/components/simulations";
import { Box, Typography } from "@mui/material";
import QuickAccessButtons from "@/components/quick-access-buttons";

export default function Main() {
  return (
    <div>
      <NavBar showSettingsBackButton={false} />
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