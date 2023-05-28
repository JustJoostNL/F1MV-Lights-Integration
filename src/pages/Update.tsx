import { CircularProgress, Container, Grid } from "@mui/material";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";

export default function UpdateScreen(){
  const [platform, setPlatform] = useState<string>("");

  useEffect(() => {
    setPlatform(process.platform);
  }, []);

  return (
    <Container>
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: "100vh" }}
      >
        <Grid item xs={3}>
          <CircularProgress
            thickness={5}
            color={"secondary"}
            sx={{ ml: 2 }}
          />
          <Typography
            sx={{
              color: "text.primary",
              mt: 2,
            }}
          >
            Updating...
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
}