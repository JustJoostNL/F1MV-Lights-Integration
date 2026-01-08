import LoadingButton from "@mui/lab/LoadingButton";
import { enqueueSnackbar } from "notistack";
import React, { useCallback, useState } from "react";
import { IntegrationPlugin } from "../../../shared/types/integration";

export function OpenRGBConnectButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    setLoading(true);
    // Re-initialize OpenRGB integration
    await window.f1mvli.integrationManager.initialize(
      IntegrationPlugin.OPENRGB,
    );
    const isOnline = await window.f1mvli.integrationManager.isOnline(
      IntegrationPlugin.OPENRGB,
    );
    enqueueSnackbar(
      isOnline
        ? "Connected to OpenRGB successfully!"
        : "Failed to connect to OpenRGB",
      {
        variant: isOnline ? "success" : "error",
      },
    );
    setLoading(false);
  }, []);

  return (
    <LoadingButton onClick={handleClick} variant="contained" loading={loading}>
      Connect to OpenRGB
    </LoadingButton>
  );
}
