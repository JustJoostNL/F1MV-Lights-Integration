import { mainWindow, availablePort } from "..";

export async function openInMainWindow(pathname: string) {
  const baseUrl =
    process.env.VITE_DEV_SERVER_URL || `http://localhost:${availablePort}`;
  const url = new URL(baseUrl);
  url.hash = `#${pathname}${url.search}`;
  await mainWindow?.loadURL(url.toString());
}
