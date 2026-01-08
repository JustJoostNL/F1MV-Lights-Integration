import React from "react";
import { DeviceSelector } from "../components/shared/DeviceSelector";
import { IntegrationPlugin } from "../../shared/types/integration";

export function HomebridgeAccessoriesSelector() {
  return (
    <DeviceSelector
      integrationId={IntegrationPlugin.HOMEBRIDGE}
      configKey="homebridgeAccessories"
    />
  );
}
