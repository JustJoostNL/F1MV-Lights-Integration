import LoadingButton from "@mui/lab/LoadingButton";
import { enqueueSnackbar } from "notistack";
import React, { useCallback, useState } from "react";

export function OpenRGBConnectButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    setLoading(true);
    await window.f1mvli.integrations.openrgb.connect();
    const states = await window.f1mvli.utils.getIntegrationStates();
    const openrgbState = states.find((state) => state.name === "openrgb");
    const success = openrgbState?.state;
    enqueueSnackbar(
      success
        ? "Connected to OpenRGB successfully!"
        : "Failed to connect to OpenRGB",
      {
        variant: success ? "success" : "error",
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
