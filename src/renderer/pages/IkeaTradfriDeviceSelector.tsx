import React from "react";
import { DeviceSelector } from "../components/shared/DeviceSelector";
import { IntegrationPlugin } from "../../shared/types/integration";

export function IkeaTradfriDeviceSelector() {
  return (
    <DeviceSelector
      integrationId={IntegrationPlugin.TRADFRI}
      configKey="ikeaDeviceIds"
    />
  );
}
