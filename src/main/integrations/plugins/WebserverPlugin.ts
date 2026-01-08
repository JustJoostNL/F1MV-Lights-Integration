import http from "http";
import express from "express";
import { Server } from "socket.io";
import { BaseIntegrationPlugin } from "../BaseIntegrationPlugin";
import { globalConfig } from "../../ipc/config";
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

  async initialize(): Promise<void> {
    const webApp = express();
    this.httpServer = http.createServer(webApp);
    this.ioSocket = new Server(this.httpServer);

    webApp.get("/", (_req, res) => {
      res.send(`
<html lang="en">
  <body style="background-color: black;">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.6.1/socket.io.js"></script>
    <script>
      const socket = io();
      socket.on('color-change', data => {
        document.body.style.backgroundColor = \`rgb(\${data.r}, \${data.g}, \${data.b})\`;
      });
    </script>
  </body>
</html>
`);
    });

    try {
      this.httpServer.listen(globalConfig.webserverPort, () => {
        this.log(
          "info",
          `Web server listening on http://localhost:${globalConfig.webserverPort}/`,
        );
        this.setOnline(true);
      });
    } catch (error) {
      this.log("error", `Could not start web server: ${error}`);
      this.setOnline(false);
    }
  }

  async shutdown(): Promise<void> {
    this.httpServer?.close();
    this.ioSocket?.close();
    await super.shutdown();
  }

  async control(args: IntegrationControlArgs): Promise<void> {
    const { color } = args;
    this.ioSocket?.emit("color-change", {
      r: color.r,
      g: color.g,
      b: color.b,
    });
  }
}

export const webserverPlugin = new WebserverPlugin();
