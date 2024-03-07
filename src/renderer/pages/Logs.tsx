import React from "react";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import useSWR from "swr";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { ContentLayout } from "../components/layouts/ContentLayout";

export function LogsPage() {
  useDocumentTitle("Logs — F1MV Lights Integration");

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

  const Row = ({ index, style }: ListChildComponentProps) => {
    if (!logData) return null;
    const log = logData[index];
    return (
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemText primary={log} />
      </ListItem>
    );
  };

  return (
    <ContentLayout title="Logs" container isLoading={!logData}>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          bgcolor: "#343434",
          overflow: "auto",
        }}
      >
        <FixedSizeList
          height={500}
          width={1000}
          itemSize={32}
          itemCount={logData?.length || 0}
          itemData={logData}
          overscanCount={5}
        >
          {Row}
        </FixedSizeList>
      </Box>
    </ContentLayout>
  );
}
