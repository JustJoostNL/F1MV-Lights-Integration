import React from "react";
import { CircularProgress, Container, Grid, Typography } from "@mui/material";

interface ILoaderProps {
  customText?: string;
}

export const Loader = ({ customText }: ILoaderProps) => {
  return (
    <Container>
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: "20vh" }}
      >
        <Grid item xs={3}>
          <CircularProgress thickness={5} color="secondary" />
          <Typography
            sx={{
              color: "text.primary",
              mt: 2,
            }}
          >
            {customText ? customText : "Loading..."}
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
};
