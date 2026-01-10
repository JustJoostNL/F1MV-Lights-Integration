import React, { FC, useCallback } from "react";
import { Switch } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";
import { IConfig } from "../../../shared/types/config";

interface IProps {
  configKey: keyof IConfig;
}

export const SettingToggle: FC<IProps> = ({ configKey }) => {
  const { config, updateConfig } = useConfig();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateConfig({
        [configKey]: event.currentTarget.checked,
      });
    },
    [configKey, updateConfig],
  );

  return (
    <Switch checked={Boolean(config[configKey])} onChange={handleChange} />
  );
};
