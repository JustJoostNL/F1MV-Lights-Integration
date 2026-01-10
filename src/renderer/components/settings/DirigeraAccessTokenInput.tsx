import React, { useCallback, useState } from "react";
import { Stack, TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useSnackbar } from "notistack";
import { useConfig } from "../../hooks/useConfig";
import { IntegrationPlugin } from "../../../shared/types/integration";

export function DirigeraAccessTokenInput() {
  const { config, updateConfig } = useConfig();
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value === "" ? undefined : event.target.value;
      updateConfig({ dirigeraAccessToken: value });
    },
    [updateConfig],
  );

  const handleGenerateToken = useCallback(async () => {
    setLoading(true);
    const snackbarId = enqueueSnackbar(
      "Please press the action button on the Dirigera hub within 60 seconds...",
      { variant: "info", persist: true },
    );
    const data = (await window.f1mvli.integrationManager.callUtility(
      IntegrationPlugin.DIRIGERA,
      "authenticate",
    )) as { accessToken: string } | null;

    if (data) {
      closeSnackbar(snackbarId);
      setLoading(false);
      enqueueSnackbar("Token generated successfully", { variant: "success" });
      updateConfig({ dirigeraAccessToken: data.accessToken });
    } else {
      closeSnackbar(snackbarId);
      enqueueSnackbar(
        "Error generating token, did you press the action button on the Dirigera hub?",
        { variant: "error", autoHideDuration: 3000 },
      );
      setLoading(false);
    }
  }, [closeSnackbar, enqueueSnackbar, updateConfig]);

  return (
    <Stack direction="row" spacing={2}>
      <LoadingButton
        loading={loading}
        variant="contained"
        onClick={handleGenerateToken}
        sx={{ height: "80%", alignSelf: "center" }}
      >
        Generate Token
      </LoadingButton>
      <TextField
        value={config.dirigeraAccessToken || ""}
        onChange={handleInputChange}
        label="Access Token"
        variant="outlined"
      />
    </Stack>
  );
}
