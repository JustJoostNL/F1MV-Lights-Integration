import React from "react";

export function HandleFlagChange(flag: string, checked: boolean, settings: any, setSettings: React.Dispatch<React.SetStateAction<any>>) {
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
