interface IEffectAction {
  type: "on" | "delay";
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
  onFlag: string;
  enabled: boolean;
  actions: IEffectAction[];
  amount: number;
}

export interface IEffectSettingsConfig {
  length: number;
  effectSettings: IEffectSetting[];
}