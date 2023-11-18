import React from "react";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

export const DonateButton = () => {
  return (
    <Tooltip
      arrow
      title="F1MV Lights Integration is completely free to use, but if you want to support the app, consider donating 💚"
    >
      <Box>
        <Button
          href="https://donate.jstt.me"
          target="_blank"
          rel="noreferrer"
          variant="contained"
          color="success"
          startIcon={<SavingsRoundedIcon />}
          endIcon={<OpenInNewRoundedIcon />}
        >
          Donate
        </Button>
      </Box>
    </Tooltip>
  );
};
