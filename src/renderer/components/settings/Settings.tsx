import React, { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Card,
  CardActionArea,
  CardHeader,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  styled,
} from "@mui/material";
import {
  KeyboardArrowUpRounded,
  KeyboardArrowDownRounded,
} from "@mui/icons-material";
import { JSONTree } from "react-json-tree";
import { useConfig } from "../../hooks/useConfig";
import { AutoTurnOffLightsToggle } from "./AutoTurnOffLightsToggle";
import { AutoMultiViewerStartToggle } from "./AutoMultiViewerStartToggle";
import { DefaultBrightnessSlider } from "./DefaultBrightnessSlider";
import { GoBackToStaticToggle } from "./GoBackToStaticToggle";
import { GoBackToStaticDelayInput } from "./GoBackToStaticDelayInput";
import { GoBackToStaticEventSelector } from "./GoBackToStaticEventSelector";
import { ColorCustomization } from "./ColorCustomization";

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  marginRight: theme.spacing(2),
}));

const InputWrapper = styled("div")(() => ({
  flexShrink: 0,
  maxWidth: "40%",
}));

export function Settings() {
  const { config } = useConfig();
  const [debug, setDebug] = useState(false);
  const [generalCardOpen, setGeneralCardOpen] = useState(true);

  useHotkeys("d", () => {
    setDebug(!debug);
  });

  return (
    <Stack>
      <Card>
        <CardActionArea onClick={() => setGeneralCardOpen(!generalCardOpen)}>
          <CardHeader
            title="General"
            subheader="General settings for the application"
            action={
              generalCardOpen ? (
                <KeyboardArrowUpRounded />
              ) : (
                <KeyboardArrowDownRounded />
              )
            }
            sx={{
              "& .MuiCardHeader-action": {
                mt: 0,
                mr: 0,
                mb: 0,
                alignSelf: "center",
              },
            }}
          />
        </CardActionArea>

        <Collapse in={generalCardOpen}>
          <List>
            <ListItem>
              <StyledListItemText
                primary="Automatically turn off lights when the session has ended"
                secondary="This will automatically turn off all lights when the session has ended."
              />
              <InputWrapper>
                <AutoTurnOffLightsToggle />
              </InputWrapper>
            </ListItem>
            <ListItem>
              <StyledListItemText
                primary="Automatically start MultiViewer when the application starts"
                secondary="This will automatically start MultiViewer when the application starts."
              />
              <InputWrapper>
                <AutoMultiViewerStartToggle />
              </InputWrapper>
            </ListItem>
            <Divider />
            <ListItem>
              <StyledListItemText
                primary="Default brightness"
                secondary="This is the default brightness for all lights."
              />
              <InputWrapper>
                <DefaultBrightnessSlider />
              </InputWrapper>
            </ListItem>
            <Divider />
            <ListItem>
              <StyledListItemText
                primary="Go back to static"
                secondary="Automatically go back to a (customizable) static color after a (customizable) amount of time."
              />
              <InputWrapper>
                <GoBackToStaticToggle />
              </InputWrapper>
            </ListItem>
            {config.goBackToStatic && (
              <>
                <ListItem>
                  <StyledListItemText
                    primary="Go back to static delay"
                    secondary="After how many seconds should the lights go back to static?"
                  />
                  <GoBackToStaticDelayInput />
                </ListItem>
                <ListItem>
                  <StyledListItemText
                    primary="Go back to static enabled events"
                    secondary="On which events should the lights go back to static?"
                  />
                  <GoBackToStaticEventSelector />
                </ListItem>
              </>
            )}
            <Divider />
            <ListItem>
              <StyledListItemText
                primary="Color customization"
                secondary="If you have a color vision deficiency, or just like to have a different color to represent a team, you can customize the colors used for the events."
              />
              <ColorCustomization />
            </ListItem>
          </List>
        </Collapse>
      </Card>
      {debug && <JSONTree data={config} />}
    </Stack>
  );
}
