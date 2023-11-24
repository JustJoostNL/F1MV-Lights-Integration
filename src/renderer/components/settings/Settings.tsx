import React, { useCallback, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Button, Card, CardHeader, List, ListItem, Stack } from "@mui/material";
import { JSONTree } from "react-json-tree";
import { defaultConfig } from "../../../shared/config/defaultConfig";
import { useConfig } from "../../hooks/useConfig";
import { AutoTurnOffLightsToggle } from "./AutoTurnOffLightsToggle";
import { AutoMultiViewerStartToggle } from "./AutoMultiViewerStartToggle";
import { DefaultBrightnessSlider } from "./DefaultBrightnessSlider";
import { EventSettings } from "./EventSettings";
import {
  ListItemTextStyled,
  SettingsGroup,
  SettingsGroupProps,
} from "./SettingsGroup";
import { MultiViewerLiveTimingUrlInput } from "./MultiViewerLiveTimingUrlInput";
import { MultiViewerSyncToggle } from "./MultiViewerSyncToggle";
import { UpdateChannelSelector } from "./UpdateChannelSelector";
import { DebugModeToggle } from "./DebugModeToggle";

interface ISettings extends SettingsGroupProps {
  type?: "normal" | "experimental" | "debug";
}

export function Settings() {
  const { config, setConfig } = useConfig();
  const [debug, setDebug] = useState(false);
  useHotkeys("shift+d", () => {
    setDebug(!debug);
  });

  const handleResetConfig = useCallback(() => {
    setConfig(defaultConfig);
  }, [setConfig]);

  const settings: ISettings[] = [
    {
      defaultOpen: true,
      title: "General",
      description: "General settings for the application",
      settings: [
        {
          type: "setting",
          title: "Automatically turn off lights when the session has ended",
          description:
            "This will automatically turn off all lights when the session has ended.",
          configKeys: ["autoTurnOffLightsWhenSessionEnds"],
          input: <AutoTurnOffLightsToggle />,
        },
        {
          type: "setting",
          title: "Automatically start MultiViewer when the application starts",
          description:
            "This will automatically start MultiViewer when the application starts.",
          configKeys: ["startMultiViewerWhenAppStarts"],
          input: <AutoMultiViewerStartToggle />,
        },
        {
          type: "setting",
          title: "Default brightness",
          description: "This is the default brightness for all lights.",
          configKeys: ["defaultBrightness"],
          input: <DefaultBrightnessSlider />,
        },
        {
          type: "setting",
          title: "Event settings",
          description:
            "Here you can enhance your experience by customizing what happens on certain events.",
          configKeys: ["events"],
          input: <EventSettings />,
        },
      ],
    },
    {
      title: "MultiViewer Settings",
      description: "Settings related to MultiViewer",
      settings: [
        {
          type: "setting",
          title: "Live Timing URL",
          description: "This is the MultiViewer Live Timing URL.",
          configKeys: ["multiviewerLiveTimingURL"],
          input: <MultiViewerLiveTimingUrlInput />,
        },
        {
          type: "setting",
          title: "Sync with MultiViewer",
          description:
            "When disabled, the app will not sync with the current status of the MultiViewer Live Timing.",
          configKeys: ["multiviewerCheck"],
          input: <MultiViewerSyncToggle />,
        },
      ],
    },
    {
      title: "Experimental settings",
      description: "Settings for experimental features",
      type: "experimental",
      settings: [
        {
          type: "setting",
          title: "Debug mode",
          description:
            "This will enable debug mode, enable this if you want to see debug messages in the logs.",
          configKeys: ["debugMode"],
          input: <DebugModeToggle />,
        },
        {
          type: "setting",
          title: "Update channel",
          description:
            "The update channel the app uses to automatically update.",
          configKeys: ["updateChannel"],
          input: <UpdateChannelSelector />,
        },
      ],
    },
  ];

  return (
    <Stack gap={3} mb={3}>
      {settings.map((setting, index) =>
        setting.type !== "debug" || debug ? (
          <SettingsGroup
            key={index}
            experimental={
              setting.type === "experimental" || setting.type === "debug"
            }
            defaultOpen={setting.defaultOpen}
            title={setting.title}
            description={setting.description}
            settings={setting.settings}
          />
        ) : null,
      )}
      <Card variant="outlined" sx={{ borderColor: "error.main" }}>
        <CardHeader
          title="Danger area"
          titleTypographyProps={{ color: "error.main" }}
        />
        <List>
          <ListItem>
            <ListItemTextStyled
              primary="Restore default settings"
              secondary="This will reset all settings to their default value. You can't undo this"
            />
            <Button
              onClick={handleResetConfig}
              color="error"
              variant="contained"
            >
              Restore default settings
            </Button>
          </ListItem>
        </List>
      </Card>
      {debug && <JSONTree data={config} />}
    </Stack>
  );
}
