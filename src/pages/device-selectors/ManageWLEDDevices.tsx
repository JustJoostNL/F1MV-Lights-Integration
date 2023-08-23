import ReactGA from "react-ga4";
import {
  TextField,
  ListItem,
  ListItemText,
  Box,
  Paper,
  IconButton,
} from "@mui/material";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import Button from "@mui/material/Button";
import log from "electron-log/renderer";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";
import {isIPv4} from 'is-ip';

export default function ManageWLEDDevices() {
  const [devices, setDevices] = useState<string[]>([]);
  const [ipInput, setIpInput] = useState<string>("");
  const [alreadySelectedDevices, setAlreadySelectedDevices] = useState<string[]>(["loadingINTERNAL"]);

  useEffect(() => {
    async function fetchDevices() {
      try {
        const data = await window.f1mvli.integrations.WLED.getDevices();
        setAlreadySelectedDevices(data);
      } catch (e) {
        log.error("Failed to fetch the WLED devices! Error: ", e);
      }
    }
    fetchDevices();
  }, []);

  useEffect(() => {
    if (alreadySelectedDevices[0] === "loadingINTERNAL") return;
    const deviceList = [...alreadySelectedDevices, ...devices];
    window.f1mvli.config.set("Settings.WLEDSettings.devices", deviceList);
  }, [devices, alreadySelectedDevices]);

  const addDevice = () => {
    if (ipInput === "") return;
    setDevices([...devices, ipInput]);
    setIpInput("");
  };

  const removeDevice = (index: number) => {
    const newDevices = devices.filter((d, i) => i !== index);
    setDevices(newDevices);
  };

  const removeSelectedDevice = (ip: string) => {
    const newSelectedDevices = alreadySelectedDevices.filter((d) => d !== ip);
    setAlreadySelectedDevices(newSelectedDevices);
  };

  ReactGA.send({ hitType: "pageview", page: "/manage-wled-devices" });

  return (
    <div>
      <h1>Manage WLED Devices</h1>
      <TextField
        id="wled-device-ip-input"
        label="WLED Device IP"
        color="secondary"
        variant="outlined"
        value={ipInput}
        onChange={(event) => setIpInput(event.target.value)}
        helperText={isIPv4(ipInput) ? '✔ This looks fine.' : 'Please use the IPv4 format xxx.xxx.xxx.xxx'}
      />
      <Button
        sx={{ ml: "15px", mt: "10px" }}
        id="wled-device-add-button"
        variant="contained"
        color="secondary"
        disableElevation
        onClick={addDevice}
        disabled={ipInput === ""}
      >
        Add
      </Button>
      <Box sx={{ marginTop: "40px" }}>
        <Paper
          sx={{
            ml: 2,
            width: 500,
            height: 300,
          }}
        >
          <FixedSizeList
            height={300}
            width={500}
            itemSize={40}
            itemCount={devices.length + alreadySelectedDevices.length}
          >
            {({ index, style }: ListChildComponentProps) => {
              if (index < alreadySelectedDevices.length) {
                return (
                  <ListItem style={style} key={index}>
                    <ListItemText
                      primary={`${alreadySelectedDevices[index]}`}
                    />
                    <IconButton
                      aria-label="delete device"
                      onClick={() =>
                        removeSelectedDevice(alreadySelectedDevices[index])
                      }
                    >
                      <DeleteIcon sx={{ color: "#ffffff" }} />
                    </IconButton>
                  </ListItem>
                );
              } else {
                const deviceIndex = index - alreadySelectedDevices.length;
                return (
                  <ListItem style={style} key={index}>
                    <ListItemText primary={`${devices[deviceIndex]}`} />
                    <IconButton
                      aria-label="delete device"
                      onClick={() => removeDevice(deviceIndex)}
                    >
                      <DeleteIcon sx={{ color: "#ffffff" }} />
                    </IconButton>
                  </ListItem>
                );
              }
            }}
          </FixedSizeList>
        </Paper>
      </Box>
    </div>
  );
}