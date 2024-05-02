import path from "path";
import { mainWindow } from "../main";

export async function openInMainWindow(pathname: string) {
  // const baseUrl =
  //   process.env.VITE_DEV_SERVER_URL || `http://localhost:${availablePort}`;
  // const url = new URL(baseUrl);
  // url.hash = `#${pathname}${url.search}`;
  // await mainWindow?.loadURL(url.toString());

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    const url = new URL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    url.hash = `#${pathname}${url.search}`;
    await mainWindow?.loadURL(url.toString());
  } else {
    // mainWindow?.loadFile(
    //   path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    // );
    const url = new URL(
      `file://${path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)}`,
    );
    url.hash = `#${pathname}${url.search}`;
    await mainWindow?.loadURL(url.toString());
  }
}
