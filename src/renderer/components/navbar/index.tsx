import React from "react";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ThreeDotMenu } from "./menu";

interface NavBarProps {
  showBackButton: boolean;
  backButtonLocationHash?: string;
}

export function Navbar({
  showBackButton,
  backButtonLocationHash,
}: NavBarProps) {
  const handleBackButton = () => {
    if (backButtonLocationHash) {
      window.location.hash = backButtonLocationHash;
    } else {
      window.location.hash = "/home";
    }
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
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, textAlign: "left", fontSize: "2rem" }}
        >
          F1MV Lights Integration
        </Typography>
        <ThreeDotMenu />
      </Toolbar>
    </AppBar>
  );
}
