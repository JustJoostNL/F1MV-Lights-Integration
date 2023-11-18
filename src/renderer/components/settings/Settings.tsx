import React, { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Card,
  CardActionArea,
  CardHeader,
  Collapse,
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
          </List>
        </Collapse>
      </Card>
      {debug && <JSONTree data={config} />}
    </Stack>
  );
}
