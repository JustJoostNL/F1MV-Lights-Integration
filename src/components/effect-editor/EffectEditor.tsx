import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import LoadingScreen from "@/pages/LoadingScreen";
import {
  Checkbox,
  Switch,
  Button,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddIcon from "@mui/icons-material/Add";
import ShareIcon from "@mui/icons-material/Share";
import { IconButton } from "@mui/material";
import { IFlagMap } from "@/components/effect-editor/types";
import AddEffectDialog from "@/components/effect-editor/AddEffectDialog";
import EditEffectDialog from "@/components/effect-editor/EditEffectDialog";
import jwt from "jsonwebtoken";
import ImportEffectDialog from "@/components/effect-editor/ImportEffectDialog";
import Toaster from "@/components/toaster/Toaster";

export const flagNameMaps: IFlagMap = {
  green: "Green",
  yellow: "Yellow",
  red: "Red",
  safetyCar: "Safety Car",
  vsc: "Virtual Safety Car",
  vscEnding: "Virtual Safety Car Ending",
  fastestLap: "Fastest Lap",
};

export default function EffectEditor() {
  const [effects, setEffects] = useState<any>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState<any>(null);
  const [toaster, setToaster] = React.useState<{ message: string, severity: "error" | "warning" | "info" | "success", time: number } | null>(null);

  useEffect(() => {
    async function fetchEffects() {
      const fetchedEffects = await window.f1mvli.config.get("Settings.generalSettings.effectSettings");
      setEffects(fetchedEffects);
    }
    fetchEffects();
  }, []);

  const handleEdit = (row: any) => {
    const id = row.id;
    const effect = effects.find((effect: any) => effect.id === id);
    setSelectedEffect({
      ...effect,
      id: id,
    });
    setEditDialogOpen(true);
  };
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedEffect(null);
    setSelectedEffect(undefined);
  };

  const handleEditDialogSubmit = (editedEffect: any) => {
    setEditDialogOpen(false);
    const newEffects = effects.map((effect: any) => {
      if (effect.id === editedEffect.id) {
        return editedEffect;
      }
      return effect;
    });
    setEffects(newEffects);
    window.f1mvli.config.set("Settings.generalSettings.effectSettings", newEffects);
  };

  const handleDelete = (row: any) => () => {
    const id = row.id;
    const newEffects = effects.filter((effect: any) => effect.id !== id);
    setEffects(newEffects);
    window.f1mvli.config.set("Settings.generalSettings.effectSettings", newEffects);
  };

  const handleAdd = () => {
    setAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
  };

  const handleAddDialogSubmit = (newEffect: any) => {
    setAddDialogOpen(false);
    const newEffects = [...effects, newEffect];
    setEffects(newEffects);
    window.f1mvli.config.set("Settings.generalSettings.effectSettings", newEffects);
  };

  const handleImport = () => {
    setImportDialogOpen(true);
  };
  const handleCloseImportDialog = () => {
    setImportDialogOpen(false);
  };
  const handleImportDialogSubmit = async (token: string) => {
    setImportDialogOpen(false);
    const decoded = jwt.verify(token, "f1mvli");
    // @ts-ignore
    if (decoded.singleEffect) {
      // @ts-ignore
      const newEffect = decoded.singleEffect[0];
      const highestId = await window.f1mvli.utils.getHighestEffectId();
      newEffect.id = highestId + 1;
      const newEffects = [...effects, newEffect];
      setEffects(newEffects);
      await window.f1mvli.config.set("Settings.generalSettings.effectSettings", newEffects);
      setToaster({ message: "Effect successfully imported!", severity: "success", time: 3000 });
      setTimeout(() => {
        setToaster(null);
      }, 3100);
      return;
      // @ts-ignore
    } else if (decoded.effectSettings) {
      // @ts-ignore
      const newEffects = decoded.effectSettings;
      setEffects(newEffects);
      await window.f1mvli.config.set("Settings.generalSettings.effectSettings", newEffects);
      setToaster({ message: "Effects successfully imported!", severity: "success", time: 3000 });
      setTimeout(() => {
        setToaster(null);
      }, 3100);
    }
  };

  const handleExport = async () => {
    const allEffects = await window.f1mvli.config.get("Settings.generalSettings.effectSettings");
    const token = jwt.sign({ effectSettings: allEffects }, "f1mvli");
    await navigator.clipboard.writeText(token);
    setToaster({ message: "Effect token copied to clipboard!", severity: "success", time: 3000 });
    setTimeout(() => {
      setToaster(null);
    }, 3100);
  };

  const handleExportSingleEffect = async (effect: any) => {
    const id = effect.id;
    const allEffects = await window.f1mvli.config.get("Settings.generalSettings.effectSettings");
    const token = jwt.sign({ singleEffect: allEffects.filter((effect: any) => effect.id === id) }, "f1mvli");
    await navigator.clipboard.writeText(token);
    setToaster({ message: "Effect token copied to clipboard!", severity: "success", time: 3000 });
    setTimeout(() => {
      setToaster(null);
    }, 3100);
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", width: 200 },
    { field: "enabled", headerName: "Enabled", width: 100 },
    { field: "trigger", headerName: "Trigger", width: 200 },
    { field: "actions", headerName: "Actions", width: 100 },
    { field: "amount", headerName: "Repeat Amount", width: 130 },
    {
      field: "edit",
      headerName: "Tools",
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton size={"small"} onClick={() => handleEdit(params.row)}>
            <Edit />
          </IconButton>
          <IconButton size={"small"} onClick={() => handleExportSingleEffect(params.row)}>
            <ShareIcon />
          </IconButton>
          <IconButton size={"small"} onClick={handleDelete(params.row)}>
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  if (!effects) {
    return <LoadingScreen />;
  }

  const rows = effects.map((effect: any) => {
    const flagName = flagNameMaps[effect.trigger];
    return {
      name: effect.name,
      id: effect.id,
      enabled: effect.enabled ? "Yes" : "No",
      trigger: flagName,
      actions: effect.actions.length,
      amount: effect.amount,
      edit: "Edit",
    };
  });

  return (
    <div style={{ height: 528, width: "290%", alignItems: "center", alignContent: "center", marginLeft: -280 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Button variant="contained" color="secondary" startIcon={<AddIcon/>} onClick={handleAdd}>
          Create new effect
        </Button>
        <div style={{ display: "flex" }}>
          <Button sx={{ mr: 2 }} variant="outlined" color="secondary" startIcon={<FileDownloadIcon />} onClick={handleImport}>
            Import
          </Button>
          <Button variant="outlined" color="secondary" startIcon={<FileUploadIcon />} onClick={handleExport}>
            Export all
          </Button>
        </div>
      </div>
      <DataGrid
        rows={rows}
        components={{
          BaseCheckbox: React.forwardRef((props, ref) => <Checkbox color="secondary" ref={ref} {...props} />),
          BaseSwitch: React.forwardRef((props, ref) => <Switch color="secondary" ref={ref} {...props} />),
        }}
        columns={columns}
        pageSize={8}
        rowsPerPageOptions={[8]}
        disableColumnFilter
        disableColumnSelector
        disableColumnMenu
        checkboxSelection={false}
        disableSelectionOnClick
        style={{ width: "100%" }}
      />
      <AddEffectDialog open={addDialogOpen} onClose={handleCloseAddDialog} onSubmit={handleAddDialogSubmit} />
      <EditEffectDialog open={editDialogOpen} onClose={handleCloseEditDialog} onSubmit={handleEditDialogSubmit} effect={selectedEffect} />
      <ImportEffectDialog open={importDialogOpen} onClose={handleCloseImportDialog} onSubmit={handleImportDialogSubmit} />
      {toaster && <Toaster message={toaster.message} severity={toaster.severity} time={toaster.time} />}
    </div>
  );
}