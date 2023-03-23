import {CircularProgress, Container, Grid} from "@mui/material";
import Typography from "@mui/material/Typography";

const Main = () => {

    const initApp = async () => {
        // code here
        await new Promise((resolve) => setTimeout(resolve, 1000));
    };

    initApp().then(() => {window.location.hash = '/home'});

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
                    <CircularProgress thickness={5} sx={{ ml: 2 }} />
                    <Typography
                        sx={{
                            color: "text.primary",
                            mt: 2,
                        }}
                    >
                        Loading...
                    </Typography>
                </Grid>
            </Grid>
        </Container>
    );
}

export default Main