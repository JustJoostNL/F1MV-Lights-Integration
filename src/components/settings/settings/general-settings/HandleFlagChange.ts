import React from "react";

export function HandleFlagChange(flag: string, checked: boolean, setSettings: React.Dispatch<React.SetStateAction<any>>, settings: any) {
  if (checked) {
    setSettings({
      ...settings,
      goBackToStaticEnabledFlags: [...settings.goBackToStaticEnabledFlags, flag],
    });
  } else {
    setSettings({
      ...settings,
      goBackToStaticEnabledFlags: settings.goBackToStaticEnabledFlags.filter((f: any) => f !== flag),
    });
  }
}
