import { Box, AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Menu from "./menu";
import ReactGA from "react-ga4";

interface NavBarProps {
  showBackButton: boolean;
  backButtonLocationHash?: string;
}

export default function NavBar({ showBackButton, backButtonLocationHash }: NavBarProps) {

  const handleBackButton = () => {
    if (backButtonLocationHash) {
      window.location.hash = backButtonLocationHash;
    } else {
      window.location.hash = "/home";
    }
    ReactGA.event({
      category: "button_press",
      action: "navbar_back_button",
    });
  };

  return (
    <AppBar position="fixed">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {showBackButton && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleBackButton}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: "left", fontSize: "2rem" }}>
          F1MV Lights Integration
        </Typography>
        <Menu />
      </Toolbar>
    </AppBar>
  );
}