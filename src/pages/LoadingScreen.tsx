import { CircularProgress, Container, Grid } from "@mui/material";
import Typography from "@mui/material/Typography";

interface ILoadingScreenProps {
  customText?: string;
}

export default function LoadingScreen({ customText }: ILoadingScreenProps) {
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
          <CircularProgress
            thickness={5}
            color={"secondary"}
          />
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
}