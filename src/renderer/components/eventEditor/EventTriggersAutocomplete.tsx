import * as React from "react";
import { Autocomplete, Checkbox, FormControl, TextField } from "@mui/material";
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import {
  EventType,
  eventTypeReadableMap,
} from "../../../shared/types/config";

interface EventTriggersSelectorProps {
  enabledTriggers: EventType[];
  onChange: (newValue: EventType[]) => void;
}

export function EventTriggersAutocomplete({
  enabledTriggers,
  onChange,
}: EventTriggersSelectorProps) {
  return (
    <FormControl fullWidth margin="normal">
      <Autocomplete
        multiple
        autoComplete
        fullWidth
        disableCloseOnSelect
        clearIcon={false}
        options={Object.values(EventType)}
        value={enabledTriggers}
        getOptionLabel={(key) => eventTypeReadableMap[key as EventType]}
        onChange={(_event, newValue) => {
          onChange(newValue);
        }}
        renderInput={(params) => <TextField {...params} label="Triggers" />}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox
              icon={<CheckBoxOutlineBlank fontSize="small" />}
              checkedIcon={<CheckBox fontSize="small" />}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {eventTypeReadableMap[option as EventType]}
          </li>
        )}
      />
    </FormControl>
  );
}
