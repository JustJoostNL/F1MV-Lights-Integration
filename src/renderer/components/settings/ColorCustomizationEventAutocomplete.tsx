import { Autocomplete, TextField } from "@mui/material";
import React, { SyntheticEvent, useCallback } from "react";

interface ColorCustomizationEventAutocompleteProps {
  setSelectedEvent: (event: string) => void;
}

interface IEventOption {
  label: string;
  value: string;
}

const flagNameMaps: {
  [key: string]: string;
} = {
  greenFlag: "Green",
  yellowFlag: "Yellow",
  redFlag: "Red",
  safetyCar: "Safety Car",
  virtualSafetyCar: "Virtual Safety Car",
  virtualSafetyCarEnding: "Virtual Safety Car Ending",
  static: "Static Color",
};

const DEFAULT_EVENT = "greenFlag";

export function ColorCustomizationEventAutocomplete({
  setSelectedEvent,
}: ColorCustomizationEventAutocompleteProps) {
  const eventOptions: IEventOption[] = Object.keys(flagNameMaps).map(
    (flagKey) => ({
      label: flagNameMaps[flagKey],
      value: flagKey,
    }),
  );

  const eventOptionsValues = eventOptions.map((option) => option.value);
  const defaultEventOption = eventOptions.find(
    (eventOption) => eventOption.value === DEFAULT_EVENT,
  );

  const handleEventChange = useCallback(
    (_event: SyntheticEvent<Element, Event>, value: string | null) => {
      if (!value) return;
      setSelectedEvent(value);
    },
    [setSelectedEvent],
  );

  return (
    <Autocomplete
      disablePortal
      autoComplete
      autoSelect
      autoHighlight
      clearIcon={false}
      defaultValue={defaultEventOption?.value}
      onChange={handleEventChange}
      sx={{ width: 300, mb: 2, mt: 1 }}
      renderInput={(params) => <TextField {...params} label="Select Event" />}
      getOptionLabel={(option: string) => {
        const eventOption = eventOptions.find(
          (eventOption) => eventOption.value === option,
        );
        return eventOption ? eventOption.label : "";
      }}
      options={eventOptionsValues}
    />
  );
}
