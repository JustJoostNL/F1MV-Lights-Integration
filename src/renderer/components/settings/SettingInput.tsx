import React, { FC, useCallback } from "react";
import { TextField, InputAdornment } from "@mui/material";
import { useConfig } from "../../hooks/useConfig";
import { IConfig } from "../../../shared/types/config";

interface IProps {
  configKey: keyof IConfig;
  type: "number" | "string";
  label?: string;
  endAdornment?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const SettingInput: FC<IProps> = ({
  configKey,
  type,
  label,
  endAdornment,
  min,
  max,
  step,
}) => {
  const { config, updateConfig } = useConfig();

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value === "" ? undefined : event.target.value;

      if (!value) {
        updateConfig({ [configKey]: undefined });
        return;
      }

      if (type === "number") {
        const numValue = parseInt(value, 10);
        updateConfig({ [configKey]: numValue });
      } else {
        updateConfig({ [configKey]: value });
      }
    },
    [configKey, type, updateConfig],
  );

  return (
    <TextField
      defaultValue={config[configKey]}
      onChange={handleInputChange}
      label={label}
      variant="outlined"
      type={type}
      slotProps={{
        ...(type === "number" && {
          htmlInput: { min, max, step },
        }),
        ...(endAdornment && {
          input: {
            endAdornment: (
              <InputAdornment position="end">{endAdornment}</InputAdornment>
            ),
          },
        }),
      }}
    />
  );
};
