import { dialog } from "electron";
import { openInMainWindow } from "../utils/openInMainWindow";
import { getConfig, patchConfig } from "../ipc/config";
import {
  ActionType,
  Event,
  eventTypeReadableMap,
} from "../../shared/config/config_types";

export async function handleOpenWhitelisted(
  url: URL,
  _groups: RegExpMatchArray | null,
) {
  await openInMainWindow(`${url.pathname}${url.search}`);
}

export async function handlePatchConfig(
  url: URL,
  _groups: RegExpMatchArray | null,
) {
  try {
    const config = JSON.parse(url.searchParams.get("config") ?? "{}");

    if (!config) return;

    const { response } = await dialog.showMessageBox({
      type: "question",
      defaultId: 0,
      buttons: ["Apply config changes", "Cancel"],
      title: "Do you want to apply config changes?",
      message: "Do you want to apply config changes?",
      detail: `Config patch:\n\n${JSON.stringify(config, null, 2)}`,
    });

    if (response === 1) return;

    await patchConfig(config);
  } catch (error) {
    dialog.showErrorBox("Error", "Invalid config");
  }
}

export async function handleAddEvent(
  url: URL,
  _groups: RegExpMatchArray | null,
) {
  const getReadableEvent = (event: Event) => {
    const name = event.name;
    const triggers = event.triggers
      .map((trigger) => eventTypeReadableMap[trigger])
      .join(", ");

    const actions = event.actions
      .map((action, index) => {
        let actionString = `${index + 1}. ${action.type}`;
        switch (action.type) {
          case ActionType.On:
            actionString += `: ${action.color ? `RGB = ${action.color.r}, ${action.color.g}, ${action.color.b}` : "N/A"}, Brightness = ${action.brightness ?? "N/A"}`;
            break;
          case ActionType.Off:
            break;
          case ActionType.Delay:
            actionString += `: ${action.delay ?? "N/A"}ms`;
            break;
          case ActionType.GoBackToCurrentStatus:
            break;
          default:
            break;
        }
        return actionString;
      })
      .join("\n");

    return `Event:\n\nName: ${name}\nTriggers: ${triggers}\nActions:\n${actions}`;
  };

  try {
    const event = JSON.parse(url.searchParams.get("event") ?? "{}");

    if (!event) return;

    const { response } = await dialog.showMessageBox({
      type: "question",
      defaultId: 0,
      buttons: ["Apply config changes", "Cancel"],
      title: "Add shared event?",
      message: "Do you want to add this shared event to your config?",
      detail: getReadableEvent(event),
    });

    if (response === 1) return;

    const config = await getConfig();
    const events = config.events ?? [];
    const nextId = Math.max(...events.map((e) => e.id)) + 1;
    await patchConfig({
      events: [...events, { ...event, id: nextId }],
    });
  } catch (error) {
    dialog.showErrorBox("Error", "Invalid config");
  }
}
