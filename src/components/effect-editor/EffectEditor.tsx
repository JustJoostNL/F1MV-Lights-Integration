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
import {
  IFlagMap
} from "@/components/effect-editor/types";
import AddEffectDialog from "@/components/effect-editor/AddEffectDialog";

export const flagNameMaps: IFlagMap = {
  green: "Green",
  yellow: "Yellow",
  red: "Red",
  safetyCar: "Safety Car",
  vsc: "Virtual Safety Car",
  vscEnding: "Virtual Safety Car Ending",
  staticColor: "Static Color",
};

export default function EffectEditor(){
  const [effects, setEffects] = useState<any>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchEffects() {
      const fetchedEffects = await window.f1mvli.config.get("Settings.generalSettings.effectSettings");
      setEffects(fetchedEffects);
    }
    fetchEffects();
  }, []);

  const handleEdit = (row: any) => () => {
    console.log(row);
  };

  const handleDelete = (row: any) => () => {
    const name = row.name;
    const newEffects = effects.filter((effect: any) => effect.name !== name);
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
    console.log(newEffect);
    console.log(effects);
    const newEffects = [...effects, newEffect];
    console.log(newEffects);
    setEffects(newEffects);
    window.f1mvli.config.set("Settings.generalSettings.effectSettings", newEffects);
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", width: 200 },
    { field: "enabled", headerName: "Enabled", width: 100 },
    { field: "onFlag", headerName: "Trigger", width: 200 },
    { field: "actions", headerName: "Actions", width: 100 },
    { field: "amount", headerName: "Repeat Amount", width: 130 },
    {
      field: "edit",
      headerName: "Edit / Delete",
      width: 100,
      renderCell: (params) => (
        <>
          <div style={{ cursor: "pointer" }} onClick={handleEdit(params.row)}>
            <Edit
              sx={{
                mr: 2.5,
              }}
            />
          </div>
          <div style={{ cursor: "pointer" }} onClick={handleDelete(params.row)}>
            <DeleteIcon/>
          </div>
        </>
      ),
    },
  ];

  if (!effects){
    return (
      <LoadingScreen/>
    );
  }

  let idCounter = 0;

  const rows = effects.map((effect: any) => {
    idCounter++;
    console.log(idCounter);
    console.log(effect);
    const flagName = flagNameMaps[effect.onFlag];
    return {
      id: idCounter,
      name: effect.name,
      enabled: effect.enabled ? "Yes" : "No",
      onFlag: flagName,
      actions: effect.actions.length,
      amount: effect.amount,
      edit: "Edit"
    };
  });

  return (
    <div style={{ height: 528, width: "290%", alignItems: "center", alignContent: "center", marginLeft: -280 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Button variant="contained" color="secondary" onClick={handleAdd}>
          Create new effect
        </Button>
      </div>
      <DataGrid
        rows={rows}
        components={{
          BaseCheckbox: React.forwardRef((props, ref) => (
            <Checkbox color="secondary" ref={ref} {...props} />
          )),
          BaseSwitch: React.forwardRef((props, ref) => (
            <Switch color="secondary" ref={ref} {...props} />
          ))
        }}
        sx={{ color: "white" }}
        columns={columns}
        pageSize={8}
        rowsPerPageOptions={[8]}
        disableColumnFilter
        disableColumnSelector
        disableColumnMenu
        checkboxSelection={false}
        disableSelectionOnClick
      />
      <AddEffectDialog
        open={addDialogOpen}
        onClose={handleCloseAddDialog}
        onSubmit={handleAddDialogSubmit}
      />
    </div>
  );
}