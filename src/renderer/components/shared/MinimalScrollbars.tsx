import { GlobalStyles, alpha } from "@mui/material";
import React from "react";

export const MinimalScrollbars: React.FC<{ width?: number }> = ({
  width = 4,
}) => {
  return (
    <GlobalStyles
      styles={{
        "*::-webkit-scrollbar": {
          visibility: "hidden",
          width,
          height: width,
        },
        "*::-webkit-scrollbar-corner": {
          background: "transparent",
        },
        "*::-webkit-scrollbar, *::-webkit-scrollbar-track, *::-webkit-scrollbar-thumb":
          {
            visibility: "hidden",
          },
        "*:hover::-webkit-scrollbar-track, *:hover::-webkit-scrollbar-thumb": {
          visibility: "visible",
        },
        "*::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "*::-webkit-scrollbar-thumb": {
          borderRadius: 4,
          background: alpha("#fff", 0.3),
        },
      }}
    />
  );
};
