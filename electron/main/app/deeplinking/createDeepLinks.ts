import { app } from "electron";
import path from "node:path";

export default async function createDeepLinks() {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient("f1mvli", process.execPath, [path.resolve(process.argv[1])]);
    }
  } else {
    app.setAsDefaultProtocolClient("f1mvli");
  }
}