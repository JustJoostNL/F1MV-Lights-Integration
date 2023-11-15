import React, { useCallback } from "react";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ThreeDotMenu } from "./NavbarMenu";

interface NavBarProps {
  hideBackButton?: boolean;
}

export function Navbar({ hideBackButton = false }: NavBarProps) {
  const handleBackButton = useCallback(() => {
    window.history.back();
  }, []);

  return (
    <AppBar position="fixed">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {!hideBackButton && (
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
