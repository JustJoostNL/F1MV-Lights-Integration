import React, { useCallback } from "react";
import { Button, Stack, TextField, Tooltip } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useConfig } from "../../hooks/useConfig";
import { IntegrationPlugin } from "../../../shared/types/integration";

export function IkeaGatewayIpInput() {
  const { config, updateConfig } = useConfig();

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value === "" ? undefined : event.target.value;
      updateConfig({ ikeaGatewayIp: value });
    },
    [updateConfig],
  );

  const handleDiscoverGateway = useCallback(async () => {
    const data = (await window.f1mvli.integrationManager.callUtility(
      IntegrationPlugin.TRADFRI,
      "discoverGateway",
    )) as { addresses: string[] } | null;
    if (!data) {
      enqueueSnackbar("Error discovering gateway", { variant: "error" });
    } else if (data.addresses.length > 0) {
      enqueueSnackbar("Gateway found, reloading...", { variant: "success" });
      updateConfig({ ikeaGatewayIp: data.addresses[0] });
      window.location.reload();
    } else {
      enqueueSnackbar("No gateway found", { variant: "error" });
    }
  }, [updateConfig]);

  return (
    <Stack direction="row" spacing={2}>
      <Tooltip
        title="This will try and discover your IKEA Tradfri Gateway automatically. If a gateway is found, the window will reload."
        arrow
      >
        <Button
          variant="contained"
          onClick={handleDiscoverGateway}
          sx={{ height: "80%", alignSelf: "center" }}
        >
          Discover Gateway
        </Button>
      </Tooltip>
      <TextField
        defaultValue={config.ikeaGatewayIp}
        onChange={handleInputChange}
        label="Gateway IP"
        variant="outlined"
      />
    </Stack>
  );
}
