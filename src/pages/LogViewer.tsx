import React, { useState, useEffect } from "react";
import NavBar from "@/components/navbar";
import ReactGA from "react-ga4";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { Typography } from "@mui/material";

export default function LogViewerPage() {
  const [logs, setLogs] = useState([]);

  ReactGA.send({ hitType: "pageview", page: "/log-viewer" });
  window.f1mvli.utils.changeWindowTitle("Logs — F1MV Lights Integration");

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
      const newLogs = await window.f1mvli.log.getLogs();
      if (newLogs.length > logs.length) {
        newLogs.reverse();
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
      <h1>Logs</h1>
      <NavBar showBackButton={true} />
      <Typography variant="h4" component="h2" sx={{ fontSize: "1.2rem", mb: 3, color: "grey.400" }}>
        Logs are sorted from newest to oldest, and are updated every second.
      </Typography>
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