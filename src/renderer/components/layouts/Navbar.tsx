import React, { useCallback } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  alpha,
  lighten,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ThreeDotMenu } from "./NavbarMenu";

export function Navbar() {
  const handleBackButton = useCallback(() => {
    window.history.back();
  }, []);

  const showBackButton = window.location.hash !== "#/home";

  return (
    <>
      <AppBar
        variant="elevation"
        sx={{
          backgroundColor: alpha(lighten("#000", 0.1), 0.9),
          backdropFilter: "blur(10px) saturate(180%)",
        }}
        position="sticky"
      >
        <Toolbar>
          {showBackButton && (
            <IconButton edge="start" color="inherit" onClick={handleBackButton}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontSize: "2rem",
              fontWeight: 600,
              ml: showBackButton ? 1 : undefined,
            }}
          >
            F1MV Lights Integration
          </Typography>
          <ThreeDotMenu />
        </Toolbar>
      </AppBar>
    </>
  );
}
