import { createTheme } from "@mui/material";

export const theme = createTheme({
  typography: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, sans-serif",
    body1: {
      fontSize: "14px",
      letterSpacing: "-0.05px",
    },
    body2: {
      fontSize: "12px",
      letterSpacing: "-0.04px",
    },
    h1: {
      fontWeight: 500,
      fontSize: "35px",
      letterSpacing: "-0.24px",
    },
    h2: {
      fontWeight: 500,
      fontSize: "29px",
      letterSpacing: "-0.24px",
    },
    h3: {
      fontWeight: 500,
      fontSize: "24px",
      letterSpacing: "-0.06px",
    },
    h4: {
      fontWeight: 500,
      fontSize: "20px",
      letterSpacing: "-0.06px",
    },
    h5: {
      fontWeight: 600,
      fontSize: "18px",
      letterSpacing: "-0.05px",
    },
    h6: {
      fontWeight: 500,
      fontSize: "14px",
      letterSpacing: "-0.05px",
    },
  },
  components: {
    MuiCardContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&:last-child": {
            paddingBottom: theme.spacing(2),
          },
        }),
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "14px",
        },
      },
    },
  },
  palette: {
    mode: "dark",
    secondary: {
      main: "#e10600",
    },
  },
});
