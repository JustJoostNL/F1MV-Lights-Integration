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
import { ActionType, Event } from "../../../shared/types/config";
import { EventTriggersAutocomplete } from "./EventTriggersAutocomplete";
import { EventAction } from "./EffectAction";

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  eventId: number | null;
  isNew: boolean;
}

export function EventDialog({
  open,
  onClose,
  eventId,
  isNew,
}: EventDialogProps) {
  const [event, setEvent] = useState<Event | undefined>(undefined);
  const { config, updateConfig } = useConfig();

  useEffect(() => {
    if (!open) setEvent(undefined);
  }, [open]);

  useEffect(() => {
    const event = config.events.find((event) => event.id === eventId);
    if (!event) return;
    setEvent(event);
  }, [config, eventId, onClose]);

  const handleAddAction = useCallback(() => {
    if (!event) return;
    const newActions = [...event.actions];
    newActions.push({
      type: ActionType.ON,
      color: {
        r: 255,
        g: 255,
        b: 255,
      },
      brightness: 100,
    });
    setEvent({ ...event, actions: newActions });
  }, [event]);

  const handleClose = useCallback(() => {
    setEvent(undefined);
    if (isNew) {
      const newEvents = config.events.filter((event) => event.id !== eventId);
      updateConfig({ events: newEvents });
    }
    onClose();
  }, [onClose, config, updateConfig, isNew, eventId]);

  const handleSubmit = useCallback(() => {
    if (!event) return;
    const newEvents = config.events.map((configEvents) => {
      if (configEvents.id !== event.id) return configEvents;
      return event;
    });
    updateConfig({ events: newEvents });
    onClose();
  }, [event, updateConfig, config, onClose]);

  const handleSimulateClick = useCallback(() => {
    const event = config.events.find((ev) => ev.id === eventId);
    const eventTrigger = event?.triggers[0];
    if (!eventTrigger) return;
    window.f1mvli.eventManager.simulate(eventTrigger);
  }, [config, eventId]);

  const isSubmitButtonDisabled = useMemo(() => {
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
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
    >
      <DialogTitle>{isNew ? "Create New Event" : "Edit Event"}</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Event Name"
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
            label="Enable event"
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
            <EventAction
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

        <Typography variant="body2" component="div" sx={{ color: "grey" }}>
          Go back to static settings
        </Typography>

        <FormControl fullWidth margin="dense">
          <FormControlLabel
            control={<Switch />}
            label="Go back to static after event ends"
            sx={{ mb: 1 }}
            checked={event.goBackToStatic}
            onChange={() =>
              setEvent({ ...event, goBackToStatic: !event.goBackToStatic })
            }
          />
        </FormControl>

        <Divider sx={{ mb: 2 }} />

        <Typography
          variant="body2"
          component="div"
          sx={{ color: "grey", mb: -0.5, mt: 1 }}
        >
          How many times should the given actions repeat? (Fill in 1 if you
          don't want it to repeat)
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
          Note: If you want to repeat the given actions, make sure to add a
          delay at the end of the action. Otherwise, it will instantly go from
          the last action to the first action.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="outlined" onClick={handleSimulateClick}>
          Simulate Event
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitButtonDisabled}
        >
          {isNew ? "Create" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
