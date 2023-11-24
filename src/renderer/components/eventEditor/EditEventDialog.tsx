import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
  FormControl,
  FormControlLabel,
  Typography,
  Divider,
} from "@mui/material";
import { useConfig } from "../../hooks/useConfig";
import { ActionType, Event } from "../../../shared/config/config_types";
import { EventTriggersAutocomplete } from "./EventTriggersAutocomplete";
import { EffectAction } from "./EffectAction";

interface EditEventDialogProps {
  open: boolean;
  onClose: () => void;
  eventId: number;
}

export function EditEventDialog({
  open,
  onClose,
  eventId,
}: EditEventDialogProps) {
  const [event, setEvent] = useState<Event | undefined>(undefined);
  const { config, updateConfig } = useConfig();

  useEffect(() => {
    const event = config.events.find((event) => event.id === eventId);
    if (!event) {
      //onClose();
      return;
    }
    setEvent(event);
  }, [config, eventId, onClose]);

  const handleAddAction = useCallback(() => {
    if (!event) return;
    const newActions = [...event.actions];
    newActions.push({
      type: ActionType.on,
      color: {
        r: 255,
        g: 255,
        b: 255,
      },
      brightness: 100,
    });
    setEvent({ ...event, actions: newActions });
  }, [event]);

  const onSubmit = useCallback(() => {
    if (!event) return;
    const newEvents = config.events.map((configEvents) => {
      if (configEvents.id !== event.id) return configEvents;
      return event;
    });
    updateConfig({ events: newEvents });
    onClose();
  }, [event, updateConfig, config, onClose]);

  const isSaveButtonDisabled = useMemo(() => {
    if (!event) return true;
    if (!event.name) return true;
    if (event.triggers.length === 0) return true;
    if (event.actions.length === 0) return true;
    return false;
  }, [event]);

  if (!event) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
    >
      <DialogTitle>Edit Event</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Effect Name"
          type="text"
          fullWidth
          value={event?.name}
          onChange={(e) => setEvent({ ...event, name: e.target.value })}
        />

        <EventTriggersAutocomplete
          enabledTriggers={event.triggers}
          onChange={(newValue) => setEvent({ ...event, triggers: newValue })}
        />

        <FormControl fullWidth margin="normal">
          <FormControlLabel
            control={<Switch />}
            label="Enable effect"
            sx={{ mb: 1 }}
            checked={event.enabled}
            onChange={() => setEvent({ ...event, enabled: !event.enabled })}
          />
        </FormControl>

        {event.actions.map((action, index) => (
          <React.Fragment key={index}>
            <Typography
              variant="body2"
              component="div"
              sx={{ mt: index === 0 ? 0 : 3 }}
            >
              Action {index + 1}
            </Typography>
            <Divider sx={{ mt: 1 }} />
            <EffectAction
              index={index}
              action={action}
              actions={event.actions}
              setActions={(newValue) =>
                setEvent({ ...event, actions: newValue })
              }
            />
          </React.Fragment>
        ))}

        <Divider sx={{ mt: 2, mb: 2 }} />
        <Button variant="contained" onClick={handleAddAction} sx={{ mb: 2 }}>
          Add Action
        </Button>
        <Divider sx={{ mb: 2 }} />

        <Typography
          variant="body2"
          component="div"
          sx={{ color: "grey", mb: -0.5, mt: 1 }}
        >
          How many times should this effect repeat? (Fill in 1 if you don't want
          it to repeat)
        </Typography>

        <TextField
          sx={{
            width: "40%",
            mr: 35,
          }}
          margin="normal"
          type="number"
          label="Repeat Amount"
          value={event.amount}
          onChange={(e) =>
            setEvent({ ...event, amount: Number(e.target.value) })
          }
        />

        <Typography
          variant="body2"
          component="div"
          sx={{ color: "grey", mt: 1 }}
        >
          Note: If you want to repeat an effect, make sure to add a delay at the
          end of the effect. Otherwise, it will instantly go from the last
          action to the first action.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={isSaveButtonDisabled}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
