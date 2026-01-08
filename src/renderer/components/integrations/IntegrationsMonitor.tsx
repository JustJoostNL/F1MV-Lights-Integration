import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardActionArea,
  CardHeader,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  List,
  Stack,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";
import {
  KeyboardArrowUpRounded,
  KeyboardArrowDownRounded,
  InfoRounded,
} from "@mui/icons-material";
import {
  IntegrationStatesMap,
  MISC_STATE_LABELS,
} from "../../../shared/types/integration";
import "./status.css";
import { useRunOnceOnMount } from "../../hooks/useRunOnceOnMount";

const ITEM_EXPLANATIONS: Partial<Record<keyof IntegrationStatesMap, string>> = {
  livesession:
    "This checks if there is a live session currently active on F1TV.",
};

export function IntegrationsMonitor() {
  const [states, setStates] = useState<Partial<IntegrationStatesMap>>({});
  const [open, setOpen] = useState(true);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const pluginsRef = React.useRef<Array<{ id: string; name: string }>>([]);

  const toggleOpen = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  useRunOnceOnMount(() => {
    (async () => {
      const initialStates = await window.f1mvli.integrationManager.getStates();
      setStates(initialStates || {});

      const plugins = await window.f1mvli.integrationManager.getAll();
      pluginsRef.current = plugins || [];

      const newLabels: Record<string, string> = {};
      Object.keys(initialStates || {}).forEach((key) => {
        const plugin = pluginsRef.current.find((p) => p.id === key);
        newLabels[key] =
          plugin?.name ||
          MISC_STATE_LABELS[key as keyof IntegrationStatesMap] ||
          key;
      });

      setLabels(newLabels);
    })();
  });

  useEffect(() => {
    const keys = Object.keys(states || {});
    if (keys.length === 0) return;

    setLabels((prev) => {
      const next = { ...prev };
      keys.forEach((key) => {
        if (next[key]) return;
        const plugin = pluginsRef.current.find((p) => p.id === key);
        next[key] =
          plugin?.name ||
          MISC_STATE_LABELS[key as keyof IntegrationStatesMap] ||
          key;
      });
      return next;
    });
  }, [states]);

  useEffect(() => {
    const unsubscribe =
      window.f1mvli.integrationManager.onStatesUpdated(setStates);

    return unsubscribe;
  }, []);

  const isLoading = !states || Object.keys(states).length === 0;

  return (
    <Card sx={{ width: "70%" }}>
      <CardActionArea onClick={toggleOpen}>
        <CardHeader
          title="Integration States"
          action={
            open ? <KeyboardArrowUpRounded /> : <KeyboardArrowDownRounded />
          }
          sx={{
            "& .MuiCardHeader-action": {
              alignSelf: "center",
              m: 0,
            },
          }}
        />
      </CardActionArea>

      <Collapse in={open}>
        <Divider />

        {isLoading ? (
          <Box
            height={80}
            display="grid"
            alignItems="center"
            justifyContent="center"
          >
            <CircularProgress />
          </Box>
        ) : (
          <List disablePadding>
            {Object.entries(states).map(([key, value]) => (
              <React.Fragment key={key}>
                <Divider />

                <CardHeader
                  title={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography fontSize={18} fontWeight={500}>
                        {labels[key] || "Unknown integration"}
                      </Typography>

                      {ITEM_EXPLANATIONS[key as keyof IntegrationStatesMap] && (
                        <Tooltip
                          arrow
                          title={
                            ITEM_EXPLANATIONS[key as keyof IntegrationStatesMap]
                          }
                        >
                          <IconButton size="small" sx={{ p: 0 }}>
                            <InfoRounded color="primary" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  }
                  action={
                    <div className={`status ${value ? "success" : "error"}`} />
                  }
                  sx={{
                    "& .MuiCardHeader-action": {
                      alignSelf: "center",
                      m: 0,
                    },
                  }}
                />
              </React.Fragment>
            ))}
          </List>
        )}
      </Collapse>
    </Card>
  );
}
