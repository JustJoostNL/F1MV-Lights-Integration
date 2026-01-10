import React from "react";
import { DeviceSelector } from "../components/shared/DeviceSelector";
import { IntegrationPlugin } from "../../shared/types/integration";

export function DirigeraDeviceSelector() {
  return (
    <DeviceSelector
      integrationId={IntegrationPlugin.DIRIGERA}
      configKey="dirigeraDeviceIds"
    />
  );
}
