import { Box, AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Menu from "./menu";

export default function NavBar({ showBackButton }: { showBackButton: boolean }) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed">
        <Toolbar sx={{ flexGrow: 1, textAlign: "right" }}>
          {showBackButton && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={() => (window.location.hash = "/home")}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  flexGrow: 1,
                  textAlign: "left",
                  fontSize: "2rem",
                }}
              >
                                F1MV Lights Integration
              </Typography>
            </Box>
          )}
          {!showBackButton && (
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                textAlign: "left",
                fontSize: "2rem",
              }}
            >
                            F1MV Lights Integration
            </Typography>
          )}
          <Box sx={{ ml: "auto" }}>
            <Menu />
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
