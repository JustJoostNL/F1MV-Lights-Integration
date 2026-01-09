import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Stack,
  FormGroup,
  Checkbox,
  InputAdornment,
  Divider,
  Typography,
} from "@mui/material";
import { PlayArrowRounded } from "@mui/icons-material";
import { useConfig } from "../../hooks/useConfig";
import {
  driverAudioEventReadableMap,
  DriverAudioEventType,
  IDriverAudioAlert,
} from "../../../shared/types/config";

interface DriverAudioDialogProps {
  open: boolean;
  onClose: () => void;
  alertId: number;
  isNew: boolean;
}

export function DriverAudioDialog({
  open,
  onClose,
  alertId,
  isNew,
}: DriverAudioDialogProps) {
  const { config, updateConfig } = useConfig();
  const [formData, setFormData] = useState<IDriverAudioAlert | null>(null);

  useEffect(() => {
    if (!open) return;
    const alert = (config.driverAudioAlerts ?? []).find(
      (a) => a.id === alertId,
    );
    if (alert) setFormData({ ...alert });
  }, [open, alertId, config.driverAudioAlerts]);

  const handleSave = useCallback(() => {
    if (!formData) return;

    const alerts = config.driverAudioAlerts ?? [];
    const updatedAlerts = alerts.map((alert) =>
      alert.id === alertId ? formData : alert,
    );

    updateConfig({ driverAudioAlerts: updatedAlerts });
    onClose();
  }, [formData, alertId, config.driverAudioAlerts, updateConfig, onClose]);

  const handleCancel = useCallback(() => {
    if (isNew) {
      // Remove the newly created alert if user cancels
      const alerts = config.driverAudioAlerts ?? [];
      const updatedAlerts = alerts.filter((alert) => alert.id !== alertId);
      updateConfig({ driverAudioAlerts: updatedAlerts });
    }
    onClose();
  }, [isNew, alertId, config.driverAudioAlerts, updateConfig, onClose]);

  const handleUpdateField = useCallback(
    (field: keyof IDriverAudioAlert, value: any) => {
      if (!formData) return;
      setFormData({ ...formData, [field]: value });
    },
    [formData],
  );

  const handleToggleEvent = useCallback(
    (event: DriverAudioEventType) => {
      if (!formData) return;

      const hasEvent = formData.events.includes(event);
      const newEvents = hasEvent
        ? formData.events.filter((e) => e !== event)
        : [...formData.events, event];
      setFormData({ ...formData, events: newEvents });
    },
    [formData],
  );

  const handleBrowseFile = useCallback(async () => {
    const result = await window.f1mvli.utils.showOpenDialog({
      properties: ["openFile"],
      filters: [
        {
          name: "Audio Files",
          extensions: ["mp3", "wav", "ogg", "m4a", "flac", "aac"],
        },
      ],
    });

    if (!result.canceled && result.filePaths.length > 0 && formData) {
      setFormData({ ...formData, filePath: result.filePaths[0] });
    }
  }, [formData]);

  const handleClearFile = useCallback(() => {
    if (!formData) return;
    setFormData({ ...formData, filePath: undefined });
  }, [formData]);

  const handleTestAlert = useCallback(async () => {
    if (!formData || !formData.driverNumber.trim()) {
      return;
    }

    if (formData.filePath) {
      await window.f1mvli.utils.playAudio(formData.filePath, 1.0);
    } else {
      const defaultAudioPath = await window.f1mvli.utils.getAssetsPath(
        "team_radio_f1fx.wav",
      );
      await window.f1mvli.utils.playAudio(defaultAudioPath, 1.0);
    }
  }, [formData]);

  if (!formData) return null;

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        {isNew ? "New Driver Audio Alert" : "Edit Driver Audio Alert"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Driver number"
              value={formData.driverNumber}
              onChange={(e) =>
                handleUpdateField("driverNumber", e.target.value)
              }
              placeholder="e.g., 3"
              fullWidth
            />
            <TextField
              label="Label (optional)"
              value={formData.label ?? ""}
              onChange={(e) => handleUpdateField("label", e.target.value)}
              placeholder="e.g., Max Verstappen"
              fullWidth
            />
          </Stack>

          <FormControlLabel
            control={
              <Switch
                checked={formData.enabled}
                onChange={(e) => handleUpdateField("enabled", e.target.checked)}
              />
            }
            label="Enabled"
          />

          <Divider />

          <div>
            <Typography variant="subtitle2" gutterBottom>
              Trigger Events
            </Typography>
            <FormGroup row>
              {Object.values(DriverAudioEventType).map((event) => (
                <FormControlLabel
                  key={event}
                  control={
                    <Checkbox
                      checked={formData.events.includes(event)}
                      onChange={() => handleToggleEvent(event)}
                    />
                  }
                  label={driverAudioEventReadableMap[event]}
                />
              ))}
            </FormGroup>
          </div>

          <Divider />

          <div>
            <Typography variant="subtitle2" gutterBottom>
              Audio File (optional, leave empty for default)
            </Typography>
            <TextField
              fullWidth
              placeholder="Select a custom audio file or leave empty for default sound"
              value={formData.filePath ?? ""}
              onChange={(e) => handleUpdateField("filePath", e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleBrowseFile}
                        >
                          Browse
                        </Button>
                        <Button
                          variant="text"
                          size="small"
                          onClick={handleClearFile}
                          disabled={!formData.filePath}
                        >
                          Clear
                        </Button>
                      </Stack>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </div>

          <Button
            variant="outlined"
            startIcon={<PlayArrowRounded />}
            onClick={handleTestAlert}
            disabled={!formData.enabled || !formData.driverNumber.trim()}
            sx={{ alignSelf: "flex-start" }}
          >
            Test alert
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!formData.driverNumber.trim() || !formData.events.length}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
