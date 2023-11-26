import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { useHotkeys } from "react-hotkeys-hook";
import { JSONTree } from "react-json-tree";
import { ContentLayout } from "../components/layouts/ContentLayout";
import { IHomeAssistantStatesResponse } from "../../shared/integrations/homeAssistant_types";
import { useConfig } from "../hooks/useConfig";

const columns: GridColDef[] = [
  { field: "name", headerName: "Name", width: 200 },
  { field: "id", headerName: "ID", width: 200 },
  { field: "state", headerName: "State", width: 100 },
];

interface IData {
  devices: IHomeAssistantStatesResponse[];
  selectedDevices: string[];
}

export function HomeAssistantDeviceSelector() {
  const { config, updateConfig } = useConfig();
  const [debug, setDebug] = useState(false);
  const [data, setData] = useState<IData | null>(null);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(
    [],
  );

  useHotkeys("shift+d", () => {
    setDebug((prev) => !prev);
  });

  useEffect(() => {
    (async () => {
      const data = await window.f1mvli.integrations.homeAssistant.getDevices();
      setData(data);
      setSelectionModel(data.selectedDevices);
    })();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const fetchedData =
        await window.f1mvli.integrations.homeAssistant.getDevices();
      //@ts-ignore
      setData((data: IData | null) => {
        if (data) {
          const existingRows = data.devices;
          const newRows = fetchedData.devices.map((device) => {
            const existingRow = existingRows.find(
              (row) => row.entity_id === device.entity_id,
            );
            if (existingRow) {
              return {
                ...existingRow,
                state: device.state,
              };
            }
            return device;
          });
          return {
            devices: newRows,
            alreadySelectedDevices: data.selectedDevices,
          };
        }
        return null;
      });
    }, 2000);
    return () => clearInterval(intervalId);
  }, []);

  const rows = useMemo(() => {
    if (!data?.devices) return [];
    return data?.devices.map((device) => ({
      id: device.entity_id,
      name: device.attributes.friendly_name,
      state: device.state,
    }));
  }, [data?.devices]);

  const handleSelectionModelChange = useCallback(
    (newSelection: GridRowId[]) => {
      const selectedDevices = rows.filter((row) =>
        newSelection.includes(row.id),
      );
      const selectedDeviceIds = selectedDevices.map((device) => device.id);
      setSelectionModel(selectedDeviceIds);
      updateConfig({
        homeAssistantDevices: selectedDeviceIds,
      });
    },
    [rows, updateConfig],
  );

  return (
    <ContentLayout container title="Select Home Assistant Devices">
      <Box
        sx={{
          alignContent: "center",
          alignItems: "center",
          mb: 5,
        }}
      >
        <DataGrid
          columns={columns}
          rows={rows}
          disableColumnFilter
          disableColumnSelector
          disableColumnMenu
          disableRowSelectionOnClick
          checkboxSelection
          pageSizeOptions={[8, 12, 16]}
          initialState={{ pagination: { paginationModel: { pageSize: 8 } } }}
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={handleSelectionModelChange}
        />
        {debug && <JSONTree data={config} />}
      </Box>
    </ContentLayout>
  );
}
