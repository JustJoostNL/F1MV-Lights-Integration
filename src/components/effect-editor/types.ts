export interface IAddEffectDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (newEffect: any) => void;
}

export interface IEffectEditProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (newEffect: any) => void;
  effect: any;
}

export interface IAddEffectActionProps {
  index: number;
  action: any;
  actions: any[];
  setActions: (actions: any[]) => void;
}

export interface IColorPickerProps {
  color: any;
  onChange: (color: any) => void;
  sx?: any;
}

export interface IFlagMap {
  [key: string]: string;
}

export interface IActionOptions {
  [key: string]: string;
}