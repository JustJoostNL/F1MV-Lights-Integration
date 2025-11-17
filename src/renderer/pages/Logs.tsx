import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
  Alert,
} from "@mui/material";
import {
  SearchRounded,
  ClearRounded,
  FilterListRounded,
} from "@mui/icons-material";
import useSWR from "swr";
import { blue, grey, orange, red } from "@mui/material/colors";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { ContentLayout } from "../components/layouts/ContentLayout";

type LogLevel = "info" | "warn" | "error" | "debug" | "all";

export function LogsPage() {
  useDocumentTitle("Logs — F1MV Lights Integration");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<LogLevel>("all");

  const { data: logData } = useSWR(
    "logs",
    async () => {
      const logs = await window.f1mvli.logger.getLogs();
      return logs.reverse();
    },
    {
      refreshInterval: 1000,
    },
  );

  const filteredLogs = useMemo(() => {
    if (!logData) return [];

    let filtered = logData;

    filtered = filtered.filter((log) => log && log.trim().length > 0);

    if (searchQuery) {
      filtered = filtered.filter((log) =>
        log.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (filterLevel !== "all") {
      filtered = filtered.filter((log) =>
        log.toLowerCase().includes(`[${filterLevel}]`),
      );
    }

    return filtered;
  }, [logData, searchQuery, filterLevel]);

  const getLogColor = useCallback((log: string) => {
    if (log.toLowerCase().includes("[error]")) return red[500];
    if (log.toLowerCase().includes("[warn]")) return orange[500];
    if (log.toLowerCase().includes("[info]")) return blue[500];
    if (log.toLowerCase().includes("[debug]")) return grey[500];
    return "#fff";
  }, []);

  return (
    <ContentLayout title="Logs" container isLoading={!logData}>
      <Box sx={{ mb: 3 }}>
        <Paper
          elevation={2}
          sx={{
            p: 2,
            backgroundColor: "background.paper",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchQuery("")}
                        edge="end"
                      >
                        <ClearRounded />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              variant="outlined"
              size="small"
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FilterListRounded sx={{ color: "text.secondary" }} />
              <Chip
                label="All"
                onClick={() => setFilterLevel("all")}
                color={filterLevel === "all" ? "primary" : "default"}
                size="small"
              />
              <Chip
                label="Info"
                onClick={() => setFilterLevel("info")}
                color={filterLevel === "info" ? "primary" : "default"}
                size="small"
              />
              <Chip
                label="Warning"
                onClick={() => setFilterLevel("warn")}
                color={filterLevel === "warn" ? "primary" : "default"}
                size="small"
              />
              <Chip
                label="Error"
                onClick={() => setFilterLevel("error")}
                color={filterLevel === "error" ? "primary" : "default"}
                size="small"
              />
              <Chip
                label="Debug"
                onClick={() => setFilterLevel("debug")}
                color={filterLevel === "debug" ? "primary" : "default"}
                size="small"
              />
            </Box>
          </Stack>

          <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total Logs: {logData?.length || 0}
            </Typography>
            {searchQuery && (
              <Typography variant="body2" color="text.secondary">
                Filtered: {filteredLogs.length}
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>

      {filteredLogs.length === 0 && searchQuery ? (
        <Alert severity="info">
          No logs found matching &quot;{searchQuery}&quot;
        </Alert>
      ) : (
        <Paper
          elevation={2}
          sx={{
            backgroundColor: "#1a1a1a",
            maxHeight: "600px",
            overflow: "auto",
            fontFamily: "monospace",
          }}
        >
          {filteredLogs.map((log, index) => (
            <Box
              key={index}
              sx={{
                p: 1.5,
                borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                },
                fontSize: "0.875rem",
                lineHeight: 1.5,
                color: getLogColor(log),
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {log}
            </Box>
          ))}
        </Paper>
      )}
    </ContentLayout>
  );
}
