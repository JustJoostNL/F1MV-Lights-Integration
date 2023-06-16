import React from "react";
import NavBar from "@/components/navbar";
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Button } from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";
import DonateIcon from "@mui/icons-material/SavingsRounded";
import ReactGA from "react-ga4";
import { shell } from "electron";



export default function About() {
  ReactGA.send({ hitType: "pageview", page: "/about" });
  window.f1mvli.utils.changeWindowTitle("About — F1MV Lights Integration");

  const handleOpenDonate = () => {
    shell.openExternal("https://donate.jstt.me");
    ReactGA.event({
      category: "button_press",
      action: "donate_button_click",
    });
  };

  // @ts-ignore
  return (
    <div>
      <NavBar showBackButton={true} />
      <Box p={4}>
        <Typography variant="h4" sx={{ mt: 5 }} gutterBottom>About F1MV Lights Integration</Typography>

        <Typography variant="body1" gutterBottom>
					F1MV Lights Integration is the perfect tool for Formula 1 fans who want to add a new level of excitement to their viewing experience. By integrating your smart home lights with Formula 1 sessions, you can immerse yourself in the session like never before.
        </Typography>

        <Box mt={4} mb={2}>
          <Typography variant="h5">Features:</Typography>
        </Box>

        <List dense>
          <ListItem>
            <ListItemIcon>
              <CheckCircleOutline color="secondary" />
            </ListItemIcon>
            <ListItemText primary="Customize your smart home lights to match the flags used in Formula 1 races" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleOutline color="secondary" />
            </ListItemIcon>
            <ListItemText primary="Optimized for speed and performance" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleOutline color="secondary" />
            </ListItemIcon>
            <ListItemText primary="Intuitive and visually appealing user interface" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleOutline color="secondary" />
            </ListItemIcon>
            <ListItemText primary="Built-in settings page for easy customization" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleOutline color="secondary" />
            </ListItemIcon>
            <ListItemText primary="API check feature for quick troubleshooting" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleOutline color="secondary" />
            </ListItemIcon>
            <ListItemText primary="Supports a wide range of smart home lights, including Philips Hue, Govee, Ikea Tradfri, and any OpenRGB-compatible light (500+)!" />
          </ListItem>
        </List>

        <Box mt={4} mb={2}>
          <Typography variant="h5">Donate</Typography>
        </Box>
        <Typography variant="body1" gutterBottom>
          If you like my work, and want to support me, please consider donating or becoming a member. Thank you!
        </Typography>
        <Box mt={2} mb={2}>
          <Button
            size={"large"}
            variant="outlined"
            color="success"
            startIcon={<DonateIcon />}
            onClick={handleOpenDonate}
          >
            Donate
          </Button>
          <Typography variant={"body2"} sx={{ mt: 2 }}>
						Donations are completely voluntary and are not required to use the app, but they are greatly appreciated!
          </Typography>
        </Box>

        <Box mt={7} mb={0}>
          <Typography variant="h5">Enjoy the app!</Typography>
        </Box>
      </Box>
    </div>
  );
}