import React, { FC } from "react";
import { Button } from "@mui/material";

interface IProps {
  href: string;
  label: string;
}

export const DeviceConfigureButton: FC<IProps> = ({ href, label }) => {
  return (
    <Button variant="outlined" href={href}>
      {label}
    </Button>
  );
};
