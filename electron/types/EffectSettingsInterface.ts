interface IEffectAction {
  type: "on" | "off" | "delay" | "go_back_to_current_status";
  color?: {
    r: number;
    g: number;
    b: number;
  };
  brightness?: number;
  delay?: number;
}

export interface IEffectSetting {
  name: string;
  trigger: string;
  id: number;
  enabled: boolean;
  actions: IEffectAction[];
  amount: number;
}

export interface IEffectSettingsConfig {
  length: number;
  effectSettings: IEffectSetting[];
}