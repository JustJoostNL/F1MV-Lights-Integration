import React from "react";
import { DeviceSelector } from "../components/shared/DeviceSelector";
import { IntegrationPlugin } from "../../shared/types/integration";

export function PhilipsHueDeviceSelector() {
  return (
    <DeviceSelector
      integrationId={IntegrationPlugin.PHILIPSHUE}
      configKey="philipsHueDeviceIds"
    />
  );
}
