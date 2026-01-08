import http from "http";
import express from "express";
import { Server } from "socket.io";
import { BaseIntegrationPlugin } from "../BaseIntegrationPlugin";
import { globalConfig } from "../../ipc/config";
import { IntegrationApiError } from "../utils/error";
import {
  IntegrationPlugin,
  IntegrationControlArgs,
} from "../../../shared/types/integration";
import { IConfig } from "../../../shared/types/config";

export class WebserverPlugin extends BaseIntegrationPlugin {
  readonly id = IntegrationPlugin.WEBSERVER;
  readonly name = "Web Server";
  readonly enabledConfigKey = "webserverEnabled";
  readonly restartConfigKeys: (keyof IConfig)[] = ["webserverPort"];

  private httpServer: http.Server | undefined;
  private ioSocket: Server | undefined;

  private validateConfiguration(): void {
    if (
      !globalConfig.webserverPort ||
      globalConfig.webserverPort < 1 ||
      globalConfig.webserverPort > 65535
    ) {
      throw new IntegrationApiError("Invalid web server port configured");
    }
  }

  async initialize(): Promise<void> {
    this.validateConfiguration();
    this.log("debug", "Starting web server...");

    const webApp = express();
    this.httpServer = http.createServer(webApp);
    this.ioSocket = new Server(this.httpServer);

    webApp.get("/", (_req, res) => {
      res.send(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>F1MV Lights</title>
<style>body{margin:0;background:black;min-height:100vh;transition:background-color 0.3s}</style></head>
<body>
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.6.1/socket.io.min.js"></script>
<script>io().on('color-change',d=>document.body.style.backgroundColor=\`rgb(\${d.r},\${d.g},\${d.b})\`)</script>
</body></html>`);
    });

    webApp.get("/health", (_req, res) => res.json({ status: "ok" }));

    await new Promise<void>((resolve, reject) => {
      this.httpServer!.on("error", (error: NodeJS.ErrnoException) => {
        if (error.code === "EADDRINUSE") {
          reject(
            new IntegrationApiError(
              `Port ${globalConfig.webserverPort} is already in use`,
            ),
          );
        } else {
          reject(new IntegrationApiError(`Server error: ${error.message}`));
        }
      });

      this.httpServer!.listen(globalConfig.webserverPort, () => {
        this.setOnline(true);
        this.log(
          "info",
          `Web server listening on http://localhost:${globalConfig.webserverPort}/`,
        );
        resolve();
      });
    });
  }

  async shutdown(): Promise<void> {
    this.ioSocket?.close();
    this.ioSocket = undefined;
    if (this.httpServer) {
      await new Promise<void>((resolve) =>
        this.httpServer?.close(() => resolve()),
      );
      this.httpServer = undefined;
    }
    await super.shutdown();
  }

  async control(args: IntegrationControlArgs): Promise<void> {
    if (!this._isOnline || !this.ioSocket) return;
    this.ioSocket.emit("color-change", {
      r: args.color.r,
      g: args.color.g,
      b: args.color.b,
    });
  }
}

export const webserverPlugin = new WebserverPlugin();
