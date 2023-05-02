import React from "react";
import NavBar from "@/components/navbar";
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";



export default function About() {
  return (
    <div>
      <NavBar showSettingsBackButton={true} />
      <Box p={4}>
        <Typography variant="h4" sx={{ mt: 5 }} gutterBottom>About F1MV-Lights-Integration</Typography>

        <Typography variant="body1" gutterBottom>
					F1MV-Lights-Integration is the perfect tool for Formula 1 fans who want to add a new level of excitement to their viewing experience. By integrating your smart home lights with Formula 1 sessions, you can immerse yourself in the race like never before.
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
            <ListItemText primary="Supports a wide range of smart home lights, including Philips Hue, Nanoleaf, Govee, Ikea Tradfri, YeeLight, and OpenRGB-compatible lights" />
          </ListItem>
        </List>

        <Box mt={4} mb={2}>
          <Typography variant="h5">Donate</Typography>
        </Box>
        <Typography variant="body1" gutterBottom>
					If you want to support the development of this app, you can donate via Buy Me A Coffee. You can donate by clicking the button below, all donations are heavily appreciated!
        </Typography>
        <Box mt={2} mb={2}>
          <a href="https://www.buymeacoffee.com/justjoostnl" target="_blank" rel="noreferrer">
            <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style={{ height: "60px", width: "217px" }} />
          </a>
          <Typography variant={"body2"} sx={{ mt: 1 }}>
						Donation are completely voluntary and are not required to use the app. Donations are used to support the development of new features.
          </Typography>
        </Box>

        <Box mt={7} mb={0}>
          <Typography variant="h5">Enjoy the app!</Typography>
        </Box>
      </Box>
    </div>
  );
}