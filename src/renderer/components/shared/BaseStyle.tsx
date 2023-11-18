import React from "react";
import { GlobalStyles, Theme } from "@mui/material";

const globalStyles = (theme: Theme) => [
  {
    ":root, body, #root": {
      boxSizing: "border-box",
      height: "100%",
      backgroundColor: theme.palette.background.default,
    },
  },
];

// Hoisted to prevent rerendering
const globalStyle = <GlobalStyles styles={globalStyles} />;

export const BaseStyle: React.FC = () => {
  return globalStyle;
};
