import React, { useCallback } from "react";
import { Button, Stack, TextField, Tooltip } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useConfig } from "../../hooks/useConfig";
import { IntegrationPlugin } from "../../../shared/types/integration";

export function PhilipsHueBridgeIpInput() {
  const { config, updateConfig } = useConfig();

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value === "" ? undefined : event.target.value;
      await updateConfig({ philipsHueBridgeIP: value });
    },
    [updateConfig],
  );

  const handleDiscoverBridge = useCallback(async () => {
    const data = (await window.f1mvli.integrationManager.callUtility(
      IntegrationPlugin.PHILIPSHUE,
      "discoverBridge",
    )) as { status: string; ipAddresses: string[] } | null;
    if (!data) {
      enqueueSnackbar("Error discovering bridge", { variant: "error" });
      return;
    }
    if (data.status === "success" && data.ipAddresses.length > 0) {
      enqueueSnackbar("Bridge found, reloading...", { variant: "success" });
      await updateConfig({ philipsHueBridgeIP: data.ipAddresses[0] });
      window.location.reload();
    } else if (data.status === "rate_limit") {
      enqueueSnackbar("Rate limit reached, try again later", {
        variant: "error",
      });
    } else {
      enqueueSnackbar("No bridge found", { variant: "error" });
    }
  }, [updateConfig]);

  return (
    <Stack direction="row" spacing={2}>
      <Tooltip
        title="This will try and discover your Philips Hue Bridge automatically. If a Bridge is found, the window will reload."
        arrow
      >
        <Button
          variant="contained"
          onClick={handleDiscoverBridge}
          sx={{ height: "80%", alignSelf: "center" }}
        >
          Discover Bridge
        </Button>
      </Tooltip>
      <TextField
        defaultValue={config.philipsHueBridgeIP}
        onChange={handleInputChange}
        label="Bridge IP"
        variant="outlined"
      />
    </Stack>
  );
}
