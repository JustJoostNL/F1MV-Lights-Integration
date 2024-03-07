import { BrowserWindow } from "electron";

export function broadcastToAllWindows(event: string, data: any) {
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send(event, data);
  });
}
