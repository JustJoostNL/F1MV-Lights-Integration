import React, { useCallback, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Button, Card, CardHeader, List, ListItem, Stack } from "@mui/material";
import { JSONTree } from "react-json-tree";
import { defaultConfig } from "../../../shared/defaultConfig";
import { useConfig } from "../../hooks/useConfig";
import { useDebug } from "../../hooks/useDebug";
import { EventSettings } from "./EventSettings";
import {
  ListItemTextStyled,
  SettingsGroup,
  SettingsGroupProps,
} from "./SettingsGroup";
import { MultiViewerLiveTimingUrlInput } from "./MultiViewerLiveTimingUrlInput";
import { PhilipsHueBridgeIpInput } from "./PhilipsHueBridgeIpInput";
import { PhilipsHueBridgeTokenInput } from "./PhilipsHueBridgeTokenInput";
import { PhilipsHueSelectButton } from "./PhilipsHueSelectButton";
import { OpenRGBConnectButton } from "./OpenRGBConnectButton";
import { TradfriGatewayIpInput } from "./TradfriGatewayIpInput";
import { GlobalMaxBrightnessSlider } from "./GlobalMaxBrightnessSlider";
import { GoBackToStaticBrightnessInput } from "./GoBackToStaticBrightnessInput";
import { GoBackToStaticColorChangeButton } from "./GoBackToStaticColorChangeButton";
import { DriverAudioSettingsButton } from "./DriverAudioSettingsButton";
import { DirigeraAccessTokenInput } from "./DirigeraAccessTokenInput";
import { SettingToggle } from "./SettingToggle";
import { SettingInput } from "./SettingInput";
import { DeviceConfigureButton } from "./DeviceConfigureButton";

interface ISettings extends SettingsGroupProps {
  type?: "normal" | "experimental" | "debug";
}

export function Settings() {
  const { config, setConfig } = useConfig();
  const debug = useDebug();
  const [ikeaAdvancedVisible, setIkeaAdvancedVisible] = useState(false);

  useHotkeys("shift+a+2", () => {
    setIkeaAdvancedVisible(!ikeaAdvancedVisible);
  });

  const handleResetConfig = useCallback(() => {
    const reponse = window.confirm(
      "Are you sure you want to reset all settings to default?",
    );
    if (!reponse) return;

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
          title: "Automatically start MultiViewer when the application starts",
          description:
            "This will automatically start MultiViewer when the application starts.",
          configKeys: ["startMultiViewerWhenAppStarts"],
          input: <SettingToggle configKey="startMultiViewerWhenAppStarts" />,
        },
        {
          type: "setting",
          title: "Global maximum brightness",
          description:
            "This is the maximum brightness the app will use for the lights.",
          configKeys: ["globalMaxBrightness"],
          input: <GlobalMaxBrightnessSlider />,
        },
        {
          type: "setting",
          title: "Go back to static delay",
          description:
            "This is the delay in milliseconds the app will wait before going back to the static color.",
          configKeys: ["goBackToStaticDelay"],
          input: (
            <SettingInput
              configKey="goBackToStaticDelay"
              type="number"
              label="Delay"
              endAdornment="milliseconds"
            />
          ),
        },
        {
          type: "setting",
          title: "Go back to static brightness",
          description:
            "This is the brightness the app will use when going back to the static color.",
          configKeys: ["goBackToStaticBrightness"],
          input: <GoBackToStaticBrightnessInput />,
        },
        {
          type: "setting",
          title: "Go back to static color",
          description:
            "This is the color the app will use when going back to the static color.",
          configKeys: ["goBackToStaticColor"],
          input: <GoBackToStaticColorChangeButton />,
        },
        {
          type: "setting",
          title: "Event settings",
          description:
            "Here you can enhance your experience by customizing what happens on certain events.",
          configKeys: ["events"],
          input: <EventSettings />,
        },
        {
          type: "setting",
          title: "Driver audio alerts",
          description:
            "Configure custom audio notifications for specific drivers and events.",
          configKeys: ["driverAudioAlerts"],
          input: <DriverAudioSettingsButton />,
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
          input: <SettingToggle configKey="multiviewerCheck" />,
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
              input: <SettingToggle configKey="philipsHueEnabled" />,
            },
            {
              type: "setting",
              title: "Philips Hue Bridge IP address",
              condition: config.philipsHueEnabled,
              description:
                "You can use the button to discover your bridge, or you can enter the IP address manually.",
              configKeys: ["philipsHueBridgeIP"],
              input: <PhilipsHueBridgeIpInput />,
            },
            {
              type: "setting",
              title: "Philips Hue Bridge Token",
              condition:
                config.philipsHueEnabled &&
                typeof config.philipsHueBridgeIP === "string",
              description:
                "You can use the button to generate a new token, or you can enter a token manually.",
              configKeys: ["philipsHueBridgeAuthToken"],
              input: <PhilipsHueBridgeTokenInput />,
            },
            {
              type: "setting",
              title: "Philips Hue Devices/Groups",
              condition:
                config.philipsHueEnabled &&
                typeof config.philipsHueBridgeIP === "string",
              description:
                "Here you can configure the devices and groups that will be used for the Philips Hue integration.",
              configKeys: ["philipsHueDeviceIds", "philipsHueGroupIds"],
              input: <PhilipsHueSelectButton />,
            },
            {
              type: "setting",
              title: "Enable fade",
              condition: config.philipsHueEnabled,
              description:
                "Enable this if you want your Philips Hue devices to fade to the new color instead of instantly changing.",
              configKeys: ["philipsHueEnableFade"],
              input: <SettingToggle configKey="philipsHueEnableFade" />,
            },
          ],
        },
        {
          type: "subgroup",
          title: "IKEA Dirigera",
          settings: [
            {
              type: "setting",
              title: "Enable IKEA Dirigera integration",
              description:
                "This will enable the IKEA Dirigera integration, keep this disabled if you don't have IKEA Dirigera devices.",
              configKeys: ["dirigeraEnabled"],
              input: <SettingToggle configKey="dirigeraEnabled" />,
            },
            {
              type: "setting",
              title: "Dirigera hub IP",
              condition: config.dirigeraEnabled,
              description:
                "This is the IP address or hostname of your IKEA Dirigera hub.",
              configKeys: ["dirigeraHubIp"],
              input: (
                <SettingInput
                  configKey="dirigeraHubIp"
                  type="string"
                  label="IP Address or Hostname"
                />
              ),
            },
            {
              type: "setting",
              title: "Dirigera access token",
              condition:
                config.dirigeraEnabled &&
                typeof config.dirigeraHubIp === "string",
              description:
                "This is the authentication token for your IKEA Dirigera hub. You can generate a token or enter one manually.",
              configKeys: ["dirigeraAccessToken"],
              input: <DirigeraAccessTokenInput />,
            },
            {
              type: "setting",
              title: "Dirigera devices",
              condition: config.dirigeraEnabled,
              description:
                "Here you can configure the devices that will be used for the IKEA Dirigera integration.",
              configKeys: ["dirigeraDeviceIds"],
              input: (
                <DeviceConfigureButton
                  href="#/dirigera-ds"
                  label="Select devices"
                />
              ),
            },
            {
              type: "setting",
              title: "Enable fade",
              condition: config.dirigeraEnabled,
              description:
                "Enable this if you want your IKEA Dirigera devices to fade to the new color instead of instantly changing.",
              configKeys: ["dirigeraFadeEnabled"],
              input: <SettingToggle configKey="dirigeraFadeEnabled" />,
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
              input: <SettingToggle configKey="ikeaEnabled" />,
            },
            {
              type: "setting",
              title: "IKEA gateway IP",
              condition: config.ikeaEnabled,
              description:
                "This is the IP address of your IKEA gateway, you can use the button to discover your gateway or you can enter the IP address manually.",
              configKeys: ["ikeaGatewayIp"],
              input: <TradfriGatewayIpInput />,
            },
            {
              type: "setting",
              title: "IKEA gateway security code",
              condition: config.ikeaEnabled,
              description:
                "The security code of your IKEA gateway, you can find this at the back of your gateway.",
              configKeys: ["ikeaSecurityCode"],
              input: (
                <SettingInput
                  configKey="ikeaSecurityCode"
                  type="string"
                  label="Security Code"
                />
              ),
            },
            {
              type: "setting",
              title: "IKEA Identity",
              condition: config.ikeaEnabled && ikeaAdvancedVisible,
              description:
                "This is the identity the app uses to pair with the gateway, this is/will be generated automatically.",
              configKeys: ["ikeaIdentity"],
              input: (
                <SettingInput
                  configKey="ikeaIdentity"
                  type="string"
                  label="Identity"
                />
              ),
            },
            {
              type: "setting",
              title: "IKEA Pre-Shared Key",
              condition: config.ikeaEnabled && ikeaAdvancedVisible,
              description:
                "This is the pre-shared key the app uses to pair with the gateway, this is/will be generated automatically.",
              configKeys: ["ikeaPreSharedKey"],
              input: (
                <SettingInput
                  configKey="ikeaPreSharedKey"
                  type="string"
                  label="Pre-Shared Key"
                />
              ),
            },
            {
              type: "setting",
              title: "IKEA Trådfri devices",
              condition: config.ikeaEnabled,
              description:
                "Here you can configure the devices that will be used for the IKEA Trådfri integration.",
              configKeys: ["ikeaDeviceIds"],
              input: (
                <DeviceConfigureButton
                  href="#/ikea-tradfri-ds"
                  label="Select devices"
                />
              ),
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
              input: <SettingToggle configKey="goveeEnabled" />,
            },
            {
              type: "setting",
              title: "Enable fade",
              condition: config.goveeEnabled,
              description:
                "Enable this if you want your Govee devices to fade to the new color instead of instantly changing.",
              configKeys: ["goveeFadeEnabled"],
              input: <SettingToggle configKey="goveeFadeEnabled" />,
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
              input: <SettingToggle configKey="openrgbEnabled" />,
            },
            {
              type: "setting",
              title: "OpenRGB Server IP",
              condition: config.openrgbEnabled,
              description:
                "This is the hostname or IP of the system OpenRGB is running on. (default is localhost)",
              configKeys: ["openrgbServerIp"],
              input: (
                <SettingInput
                  configKey="openrgbServerIp"
                  type="string"
                  label="IP Address or Hostname"
                />
              ),
            },
            {
              type: "setting",
              title: "OpenRGB Server Port",
              condition: config.openrgbEnabled,
              description:
                "This is the port of the OpenRGB server, you can find this port in the 'SDK Server' tab in the OpenRGB software (default is 6742).",
              configKeys: ["openrgbServerPort"],
              input: (
                <SettingInput
                  configKey="openrgbServerPort"
                  type="number"
                  label="Port"
                  min={1}
                  max={65535}
                />
              ),
            },
            {
              type: "setting",
              title: "(Re)connect to OpenRGB",
              condition: config.openrgbEnabled,
              description:
                "This will (re)connect to the OpenRGB server, this can be useful if you have changed the OpenRGB server settings.",
              configKeys: [],
              input: <OpenRGBConnectButton />,
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
              input: <SettingToggle configKey="homeAssistantEnabled" />,
            },
            {
              type: "setting",
              title: "Home Assistant Server Host",
              condition: config.homeAssistantEnabled,
              description:
                "This is the hostname or IP of the system Home Assistant is running on. Don't forget to add http:// or https://",
              configKeys: ["homeAssistantHost"],
              input: (
                <SettingInput
                  configKey="homeAssistantHost"
                  type="string"
                  label="IP Address or Hostname"
                />
              ),
            },
            {
              type: "setting",
              title: "Home Assistant Access Port",
              condition: config.homeAssistantEnabled,
              description:
                "This is the port of the Home Assistant server (default is 8123).",
              configKeys: ["homeAssistantPort"],
              input: (
                <SettingInput
                  configKey="homeAssistantPort"
                  type="number"
                  label="Port"
                  min={1}
                  max={65535}
                />
              ),
            },
            {
              type: "setting",
              title: "Home Assistant Long-Lived Access Token",
              condition: config.homeAssistantEnabled,
              description:
                "This is the long-lived access token you can create in your Home Assistant profile.",
              configKeys: ["homeAssistantToken"],
              input: (
                <SettingInput
                  configKey="homeAssistantToken"
                  type="string"
                  label="Long-Lived Access Token"
                />
              ),
            },
            {
              type: "setting",
              title: "Home Assistant Devices",
              condition: config.homeAssistantEnabled,
              description:
                "Here you can configure the devices that will be used for the Home Assistant integration.",
              configKeys: ["homeAssistantDevices"],
              input: (
                <DeviceConfigureButton
                  href="#/home-assistant-ds"
                  label="Select devices"
                />
              ),
            },
          ],
        },
        {
          type: "subgroup",
          title: "Homebridge",
          settings: [
            {
              type: "setting",
              title: "Enable Homebridge integration",
              description:
                "This will enable the Homebridge integration, keep this disabled if you don't have Homebridge.",
              configKeys: ["homebridgeEnabled"],
              input: <SettingToggle configKey="homebridgeEnabled" />,
            },
            {
              type: "setting",
              title: "Homebridge Server Host",
              condition: config.homebridgeEnabled,
              description:
                "This is the hostname or IP of the system Homebridge is running on. Don't forget to add http:// or https://",
              configKeys: ["homebridgeHost"],
              input: (
                <SettingInput
                  configKey="homebridgeHost"
                  type="string"
                  label="IP Address or Hostname"
                />
              ),
            },
            {
              type: "setting",
              title: "Homebridge Access Port",
              condition: config.homebridgeEnabled,
              description:
                "This is the port of the Homebridge server. (default is 8581)",
              configKeys: ["homebridgePort"],
              input: (
                <SettingInput
                  configKey="homebridgePort"
                  type="number"
                  label="Port"
                  min={1}
                  max={65535}
                />
              ),
            },
            {
              type: "setting",
              title: "Homebridge Username",
              condition: config.homebridgeEnabled,
              description:
                "This is the username you can use to authenticate with the Homebridge server.",
              configKeys: ["homebridgeUsername"],
              input: (
                <SettingInput
                  configKey="homebridgeUsername"
                  type="string"
                  label="Username"
                />
              ),
            },
            {
              type: "setting",
              title: "Homebridge Password",
              condition: config.homebridgeEnabled,
              description:
                "This is the password you can use to authenticate with the Homebridge server.",
              configKeys: ["homebridgePassword"],
              input: (
                <SettingInput
                  configKey="homebridgePassword"
                  type="string"
                  label="Password"
                />
              ),
            },
            {
              type: "setting",
              title: "Homebridge Accessories",
              condition: config.homebridgeEnabled,
              description:
                "Here you can configure the accessories that will be used for the Homebridge integration.",
              configKeys: ["homebridgeAccessories"],
              input: (
                <DeviceConfigureButton
                  href="#/homebridge-as"
                  label="Select accessories"
                />
              ),
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
              input: <SettingToggle configKey="wledEnabled" />,
            },
            {
              type: "setting",
              title: "Configure WLED Devices",
              condition: config.wledEnabled,
              description:
                "Here you can configure the devices that will be used for the WLED integration.",
              configKeys: ["wledDevices"],
              input: (
                <DeviceConfigureButton
                  href="#/wled-ds"
                  label="Configure devices"
                />
              ),
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
              input: <SettingToggle configKey="mqttEnabled" />,
            },
            {
              type: "setting",
              title: "MQTT Broker Host",
              condition: config.mqttEnabled,
              description:
                "This is the hostname or IP the MQTT broker is running on. You don't have to add mqtt://",
              configKeys: ["mqttBrokerHost"],
              input: (
                <SettingInput
                  configKey="mqttBrokerHost"
                  type="string"
                  label="IP Address or Hostname"
                />
              ),
            },
            {
              type: "setting",
              title: "MQTT Broker Port",
              condition: config.mqttEnabled,
              description:
                "This is the port of the MQTT broker. (default is 1883)",
              configKeys: ["mqttBrokerPort"],
              input: (
                <SettingInput
                  configKey="mqttBrokerPort"
                  type="number"
                  label="Port"
                  min={1}
                  max={65535}
                />
              ),
            },
            {
              type: "setting",
              title: "MQTT Broker Username (optional)",
              condition: config.mqttEnabled,
              description:
                "This is the username you can use to authenticate with the MQTT broker.",
              configKeys: ["mqttBrokerUsername"],
              input: (
                <SettingInput
                  configKey="mqttBrokerUsername"
                  type="string"
                  label="Username"
                />
              ),
            },
            {
              type: "setting",
              title: "MQTT Broker Password (optional)",
              condition: config.mqttEnabled,
              description:
                "This is the password you can use to authenticate with the MQTT broker.",
              configKeys: ["mqttBrokerPassword"],
              input: (
                <SettingInput
                  configKey="mqttBrokerPassword"
                  type="string"
                  label="Password"
                />
              ),
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
              input: <SettingToggle configKey="streamdeckEnabled" />,
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
              input: <SettingToggle configKey="discordRPCEnabled" />,
            },
            {
              type: "setting",
              title: "Avoid spoilers in Discord Rich Presence",
              condition: config.discordRPCEnabled,
              description:
                "This will avoid spoilers in the Discord Rich Presence.",
              configKeys: ["discordRPCAvoidSpoilers"],
              input: <SettingToggle configKey="discordRPCAvoidSpoilers" />,
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
              input: <SettingToggle configKey="webserverEnabled" />,
            },
            {
              type: "setting",
              title: "Webserver port",
              condition: config.webserverEnabled,
              description: "This is the port the webserver will run on.",
              configKeys: ["webserverPort"],
              input: (
                <SettingInput
                  configKey="webserverPort"
                  type="number"
                  label="Port"
                  min={1}
                  max={65535}
                />
              ),
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
          input: <SettingToggle configKey="debugMode" />,
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
