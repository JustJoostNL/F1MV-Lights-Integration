import React from "react";
import { DeviceSelector } from "../components/shared/DeviceSelector";
import { IntegrationPlugin } from "../../shared/types/integration";

export function HomeAssistantDeviceSelector() {
  return (
    <DeviceSelector
      integrationId={IntegrationPlugin.HOME_ASSISTANT}
      configKey="homeAssistantDevices"
    />
  );
}
