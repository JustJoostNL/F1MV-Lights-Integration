import React from "react";
import { CircularProgress, styled } from "@mui/material";

const Root = styled("div")(() => ({
  display: "grid",
  placeItems: "center",
  placeContent: "center",
  height: "100%",
  minHeight: "80vh",
}));

export const Loader: React.FC = () => {
  return (
    <Root>
      <CircularProgress />
    </Root>
  );
};
