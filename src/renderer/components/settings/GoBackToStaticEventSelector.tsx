import * as React from "react";
import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useConfig } from "../../hooks/useConfig";

const ITEM_HEIGHT = 35;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 6.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const configEventNames = [
  "greenFlag",
  "yellowFlag",
  "redFlag",
  "safetyCar",
  "virtualSafetyCar",
  "virtualSafetyCarEnding",
];

const eventMap = {
  greenFlag: "Green flag",
  yellowFlag: "Yellow flag",
  redFlag: "Red flag",
  safetyCar: "Safety Car",
  virtualSafetyCar: "Virtual Safety Car",
  virtualSafetyCarEnding: "Virtual Safety Car Ending",
};

export function GoBackToStaticEventSelector() {
  const { config, updateConfig } = useConfig();
  const [eventNames, setEventNames] = useState<string[]>(
    config.goBackToStaticEnabledEvents,
  );

  const handleChange = (event: SelectChangeEvent<typeof eventNames>) => {
    const {
      target: { value },
    } = event;
    const newValue = typeof value === "string" ? value.split(",") : value;
    setEventNames(newValue);
    updateConfig({
      goBackToStaticEnabledEvents: newValue,
    });
  };

  const enabledEvents = useMemo(() => {
    return configEventNames.filter((x) => eventNames.includes(x));
  }, [eventNames]);

  return (
    <FormControl sx={{ width: 200 }}>
      <InputLabel>Events</InputLabel>
      <Select
        multiple
        value={eventNames}
        onChange={handleChange}
        input={<OutlinedInput label="Event" />}
        renderValue={(selected) =>
          (selected as string[]).map((x) => eventMap[x]).join(", ")
        }
        MenuProps={MenuProps}
      >
        {configEventNames.map((name) => (
          <MenuItem key={name} value={name} sx={{ height: 45 }}>
            <Checkbox checked={enabledEvents.includes(name)} />
            <ListItemText primary={eventMap[name]} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
