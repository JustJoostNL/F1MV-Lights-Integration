import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { Typography } from "@mui/material";

export default function LogViewer() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function fetchLogs() {
      let logData = await window.f1mvli.log.getLogs();
      logData = logData.reverse();
      setLogs(logData);
    }
    fetchLogs();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      let newLogs = await window.f1mvli.log.getLogs();
      if (newLogs.length > logs.length) {
        newLogs.reverse()
        setLogs(newLogs);
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [logs]);

  const Row = ({ index, style }: ListChildComponentProps) => {
    const log = logs[index];
    return (
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemText primary={log} />
      </ListItem>
    );
  };

  return (
    <div>
      <Typography variant="h4" sx={{ mb: 2 }}>Logs</Typography>
      <Box sx={{ width: "100%", height: 500, maxWidth: 1000, bgcolor: "#343434" }}>
        <FixedSizeList
          height={500}
          width={1000}
          itemSize={32}
          itemCount={logs.length}
          itemData={logs}
          overscanCount={5}
        >
          {Row}
        </FixedSizeList>
      </Box>
    </div>
  );
}