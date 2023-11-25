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
import { PhilipsHueEnabledToggle } from "./PhilipsHueEnabledToggle";
import { PhilipsHueFadeToggle } from "./PhilipsHueFadeToggle";
import { PhilipsHueThirdPartyCompatiblityModeToggle } from "./PhilipsHueThirdPartyCompatModeToggle";
import { IkeaEnabledToggle } from "./IkeaEnabledToggle";
import { IkeaSecurityCodeInput } from "./IkeaSecurityCodeInput";
import { PhilipsHueBridgeIpInput } from "./PhilipsHueBridgeIpInput";
import { PhilipsHueBridgeTokenInput } from "./PhilipsHueBridgeTokenInput";
import { IkeaIdentityInput } from "./IkeaIdentityInput";
import { IkeaPreSharedKeyInput } from "./IkeaPreSharedKeyInput";
import { GoveeEnabledToggle } from "./GoveeEnabledToggle";
import { OpenRGBEnabledToggle } from "./OpenRGBEnabledToggle";
import { OpenRGBServerIPInput } from "./OpenRGBServerIPInput";
import { OpenRGBServerPortInput } from "./OpenRGBServerPortInput";
import { HomeAssistantEnabledToggle } from "./HomeAssistantEnabledToggle";
import { HomeAssistantServerHostInput } from "./HomeAssistantServerHostInput";
import { HomeAssistantServerPortInput } from "./HomeAssistantServerPortInput";
import { HomeAssistantLongLivedAccessTokenInput } from "./HomeAssistantLongLivedAccessTokenInput";
import { WLEDEnabledToggle } from "./WLEDEnabledToggle";
import { MQTTEnabledToggle } from "./MQTTEnabledToggle";
import { MQTTBrokerHostInput } from "./MQTTBrokerHostInput";
import { MQTTBrokerPortInput } from "./MQTTBrokerPortInput";
import { MQTTBrokerUsernameInput } from "./MQTTBrokerUsernameInput";
import { MQTTBrokerPasswordInput } from "./MQTTBrokerPasswordInput";
import { StreamdeckEnabledToggle } from "./StreamdeckEnabledToggle";
import { DiscordEnabledToggle } from "./DiscordEnabledToggle";
import { DiscordAvoidSpoilersToggle } from "./DiscordAvoidSpoilersToggle";
import { WebserverEnabledToggle } from "./WebserverEnabledToggle";
import { WebserverPortInput } from "./WebserverPortInput";

interface ISettings extends SettingsGroupProps {
  type?: "normal" | "experimental" | "debug";
}

export function Settings() {
  const { config, setConfig } = useConfig();
  const [debug, setDebug] = useState(false);
  const [philipsHueAdvancedVisible, setPhilipsHueAdvancedVisible] =
    useState(false);
  const [ikeaAdvancedVisible, setIkeaAdvancedVisible] = useState(false);

  useHotkeys("shift+d", () => {
    setDebug(!debug);
  });
  useHotkeys("shift+a+1", () => {
    setPhilipsHueAdvancedVisible(!philipsHueAdvancedVisible);
  });
  useHotkeys("shift+a+2", () => {
    setIkeaAdvancedVisible(!ikeaAdvancedVisible);
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
      title: "Integration settings",
      description: "Settings for the integrations",
      settings: [
        {
          type: "subgroup",
          title: "Philips Hue",
          settings: [
            {
              type: "setting",
              title: "Enable Philips Hue integration",
              description:
                "This will enable the Philips Hue integration, keep this disabled if you don't have Philips Hue devices.",
              configKeys: ["philipsHueEnabled"],
              input: <PhilipsHueEnabledToggle />,
            },
            {
              type: "setting",
              title: "Philips Hue bridge IP address",
              condition: philipsHueAdvancedVisible && config.philipsHueEnabled,
              description:
                "If you know your Hue bridge IP, you can enter it here. If you don't know it, leave this blank, and it will be automatically detected.",
              configKeys: ["philipsHueBridgeIP"],
              input: <PhilipsHueBridgeIpInput />,
            },
            {
              type: "setting",
              title: "Philips Hue Bridge Token",
              condition: philipsHueAdvancedVisible && config.philipsHueEnabled,
              description:
                "If you know your Hue bridge token, you can enter it here. If you don't know it, leave this blank, and it will be automatically generated.",
              configKeys: ["philipsHueToken"],
              input: <PhilipsHueBridgeTokenInput />,
            },
            {
              type: "setting",
              title: "Enable fade",
              condition: config.philipsHueEnabled,
              description:
                "Enable this if you want your Hue devices to fade to the new color instead of instantly changing.",
              configKeys: ["philipsHueEnableFade"],
              input: <PhilipsHueFadeToggle />,
            },
            {
              type: "setting",
              title: "Enable third-party compatibility mode",
              condition: config.philipsHueEnabled,
              description:
                "Enable this if the third-party devices connected to your Hue bridge are not working correctly.",
              configKeys: ["philipsHueThirdPartyCompatiblityMode"],
              input: <PhilipsHueThirdPartyCompatiblityModeToggle />,
            },
          ],
        },
        {
          type: "subgroup",
          title: "IKEA Trådfri",
          settings: [
            {
              type: "setting",
              title: "Enable IKEA Trådfri integration",
              description:
                "This will enable the IKEA Trådfri integration, keep this disabled if you don't have IKEA Trådfri devices.",
              configKeys: ["ikeaEnabled"],
              input: <IkeaEnabledToggle />,
            },
            {
              type: "setting",
              title: "IKEA gateway security code",
              condition: config.ikeaEnabled,
              description:
                "The security code of your IKEA gateway, you can find this at the back of your gateway.",
              configKeys: ["ikeaSecurityCode"],
              input: <IkeaSecurityCodeInput />,
            },
            {
              type: "setting",
              title: "IKEA Identity",
              condition: config.ikeaEnabled && ikeaAdvancedVisible,
              description:
                "This is the identity the app uses to pair with the gateway, this is/will be generated automatically.",
              configKeys: ["ikeaIdentity"],
              input: <IkeaIdentityInput />,
            },
            {
              type: "setting",
              title: "IKEA Pre-Shared Key",
              condition: config.ikeaEnabled && ikeaAdvancedVisible,
              description:
                "This is the pre-shared key the app uses to pair with the gateway, this is/will be generated automatically.",
              configKeys: ["ikeaPreSharedKey"],
              input: <IkeaPreSharedKeyInput />,
            },
          ],
        },
        {
          type: "subgroup",
          title: "Govee",
          settings: [
            {
              type: "setting",
              title: "Enable Govee integration",
              description:
                "This will enable the Govee integration, keep this disabled if you don't have Govee devices.",
              configKeys: ["goveeEnabled"],
              input: <GoveeEnabledToggle />,
            },
          ],
        },
        {
          type: "subgroup",
          title: "OpenRGB",
          settings: [
            {
              type: "setting",
              title: "Enable OpenRGB integration",
              description:
                "This will enable the OpenRGB integration, keep this disabled if you don't have OpenRGB devices.",
              configKeys: ["openrgbEnabled"],
              input: <OpenRGBEnabledToggle />,
            },
            {
              type: "setting",
              title: "OpenRGB Server IP",
              condition: config.openrgbEnabled,
              description:
                "This is the hostname or IP of the system OpenRGB is running on. (default is localhost)",
              configKeys: ["openrgbServerIp"],
              input: <OpenRGBServerIPInput />,
            },
            {
              type: "setting",
              title: "OpenRGB Server Port",
              condition: config.openrgbEnabled,
              description:
                "This is the port of the OpenRGB server, you can find this port in the 'SDK Server' tab in the OpenRGB software. (default is 6742)",
              configKeys: ["openrgbServerPort"],
              input: <OpenRGBServerPortInput />,
            },
          ],
        },
        {
          type: "subgroup",
          title: "Home Assistant",
          settings: [
            {
              type: "setting",
              title: "Enable Home Assistant integration",
              description:
                "This will enable the Home Assistant integration, keep this disabled if you don't have Home Assistant.",
              configKeys: ["homeAssistantEnabled"],
              input: <HomeAssistantEnabledToggle />,
            },
            {
              type: "setting",
              title: "Home Assistant Server Host",
              condition: config.homeAssistantEnabled,
              description:
                "This is the hostname or IP of the system Home Assistant is running on. Don't forget to add http:// or https://",
              configKeys: ["homeAssistantHost"],
              input: <HomeAssistantServerHostInput />,
            },
            {
              type: "setting",
              title: "Home Assistant Access Port",
              condition: config.homeAssistantEnabled,
              description:
                "This is the port of the Home Assistant server. (default is 8123)",
              configKeys: ["homeAssistantPort"],
              input: <HomeAssistantServerPortInput />,
            },
            {
              type: "setting",
              title: "Home Assistant Long-Lived Access Token",
              condition: config.homeAssistantEnabled,
              description:
                "This is the long-lived access token you can create in your Home Assistant profile.",
              configKeys: ["homeAssistantToken"],
              input: <HomeAssistantLongLivedAccessTokenInput />,
            },
          ],
        },
        {
          type: "subgroup",
          title: "WLED",
          settings: [
            {
              type: "setting",
              title: "Enable WLED integration",
              description:
                "This will enable the WLED integration, keep this disabled if you don't have WLED devices.",
              configKeys: ["wledEnabled"],
              input: <WLEDEnabledToggle />,
            },
          ],
        },
        {
          type: "subgroup",
          title: "MQTT",
          settings: [
            {
              type: "setting",
              title: "Enable MQTT integration",
              description:
                "This will enable the MQTT integration, keep this disabled if you don't have MQTT.",
              configKeys: ["mqttEnabled"],
              input: <MQTTEnabledToggle />,
            },
            {
              type: "setting",
              title: "MQTT Broker Host",
              condition: config.mqttEnabled,
              description:
                "This is the hostname or IP the MQTT broker is running on. You don't have to add mqtt://",
              configKeys: ["mqttBrokerHost"],
              input: <MQTTBrokerHostInput />,
            },
            {
              type: "setting",
              title: "MQTT Broker Port",
              condition: config.mqttEnabled,
              description:
                "This is the port of the MQTT broker. (default is 1883)",
              configKeys: ["mqttBrokerPort"],
              input: <MQTTBrokerPortInput />,
            },
            {
              type: "setting",
              title: "MQTT Broker Username (optional)",
              condition: config.mqttEnabled,
              description:
                "This is the username you can use to authenticate with the MQTT broker.",
              configKeys: ["mqttBrokerUsername"],
              input: <MQTTBrokerUsernameInput />,
            },
            {
              type: "setting",
              title: "MQTT Broker Password (optional)",
              condition: config.mqttEnabled,
              description:
                "This is the password you can use to authenticate with the MQTT broker.",
              configKeys: ["mqttBrokerPassword"],
              input: <MQTTBrokerPasswordInput />,
            },
          ],
        },
        {
          type: "subgroup",
          title: "Elgato Stream Deck",
          settings: [
            {
              type: "setting",
              title: "Enable Elgato Stream Deck integration",
              description:
                "This will enable the Elgato Stream Deck integration, keep this disabled if you don't have an Elgato Stream Deck.",
              configKeys: ["streamdeckEnabled"],
              input: <StreamdeckEnabledToggle />,
            },
          ],
        },
        {
          type: "subgroup",
          title: "Discord",
          settings: [
            {
              type: "setting",
              title: "Enable Discord Rich Presence integration",
              description:
                "This will enable the Discord Rich Presence integration, keep this disabled if you don't want Discord Rich Presence.",
              configKeys: ["discordRPCEnabled"],
              input: <DiscordEnabledToggle />,
            },
            {
              type: "setting",
              title: "Avoid spoilers in Discord Rich Presence",
              condition: config.discordRPCEnabled,
              description:
                "This will avoid spoilers in the Discord Rich Presence.",
              configKeys: ["discordRPCAvoidSpoilers"],
              input: <DiscordAvoidSpoilersToggle />,
            },
          ],
        },
        {
          type: "subgroup",
          title: "Webserver",
          settings: [
            {
              type: "setting",
              title: "Enable webserver",
              description:
                "This will enable the webserver, keep this disabled if you don't want the webserver.",
              configKeys: ["webserverEnabled"],
              input: <WebserverEnabledToggle />,
            },
            {
              type: "setting",
              title: "Webserver port",
              condition: config.webserverEnabled,
              description: "This is the port the webserver will run on.",
              configKeys: ["webserverPort"],
              input: <WebserverPortInput />,
            },
          ],
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
