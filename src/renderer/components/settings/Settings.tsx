import React, { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Stack } from "@mui/material";
import { JSONTree } from "react-json-tree";
import { useConfig } from "../../hooks/useConfig";
import { AutoTurnOffLightsToggle } from "./AutoTurnOffLightsToggle";
import { AutoMultiViewerStartToggle } from "./AutoMultiViewerStartToggle";
import { ColorCustomization } from "./ColorCustomization";
import { DefaultBrightnessSlider } from "./DefaultBrightnessSlider";
import { EffectSettings } from "./EffectSettings";
import { GoBackToStaticToggle } from "./GoBackToStaticToggle";
import { SettingsGroup, SettingsGroupProps } from "./SettingsGroup";
import { GoBackToStaticEventSelector } from "./GoBackToStaticEventSelector";
import { GoBackToStaticBrightnessSlider } from "./GoBackToStaticBrightnessSlider";
import { GoBackToStaticDelayInput } from "./GoBackToStaticDelayInput";
import { MultiViewerLiveTimingUrlInput } from "./MultiViewerLiveTimingUrlInput";
import { MultiViewerSyncToggle } from "./MultiViewerSyncToggle";
import { UpdateChannelSelector } from "./UpdateChannelSelector";
import { DebugModeToggle } from "./DebugModeToggle";

interface ISettings extends SettingsGroupProps {
  type?: "normal" | "experimental" | "debug";
}

export function Settings() {
  const { config } = useConfig();
  const [debug, setDebug] = useState(false);
  useHotkeys("shift+d", () => {
    setDebug(!debug);
  });

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
          type: "subgroup",
          title: "Go back to static",
          settings: [
            {
              type: "setting",
              title: "Go back to static",
              description:
                "Automatically go back to a (customizable) static color after a (customizable) amount of time.",
              configKeys: ["goBackToStatic"],
              input: <GoBackToStaticToggle />,
            },
            {
              type: "setting",
              condition: config.goBackToStatic,
              title: "Go back to static delay",
              description:
                "After how many seconds should the lights go back to static?",
              configKeys: ["goBackToStaticDelay"],
              input: <GoBackToStaticDelayInput />,
            },
            {
              type: "setting",
              condition: config.goBackToStatic,
              title: "Go back to static brightness",
              description:
                "What should the brightness be when the lights go back to static?",
              configKeys: ["goBackToStaticBrightness"],
              input: <GoBackToStaticBrightnessSlider />,
            },
            {
              type: "setting",
              condition: config.goBackToStatic,
              title: "Go back to static enabled events",
              description:
                "On which events should the lights go back to static?",
              configKeys: ["goBackToStaticEvents"],
              input: <GoBackToStaticEventSelector />,
            },
          ],
        },
        {
          type: "subgroup",
          title: "Customization",
          settings: [
            {
              type: "setting",
              title: "Color customization",
              description:
                "If you have a color vision deficiency, or just like to have a different color, you can customize the colors used for the events.",
              configKeys: ["eventColors"],
              input: <ColorCustomization />,
            },
            {
              type: "setting",
              title: "Effect settings",
              description:
                "Here you can customize your experience by creating your own effects, using an advanced effect editor.",
              configKeys: ["effects"],
              input: <EffectSettings />,
            },
          ],
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
      {debug && <JSONTree data={config} />}
    </Stack>
  );
}
