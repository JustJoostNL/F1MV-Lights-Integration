import http from "http";
import express from "express";
import { Server } from "socket.io";
import log from "electron-log";
import { globalConfig } from "../../../ipc/config";
import { integrationStates } from "../states";

let webserverHTTPServer: http.Server | undefined;
let webserverIOSocket: Server | undefined;

export async function webserverInitialize() {
  const webApp = express();
  webserverHTTPServer = http.createServer(webApp);
  webserverIOSocket = new Server(webserverHTTPServer);

  webApp.get("/", (req, res) => {
    res.send(
      `
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
`,
    );
  });

  try {
    webserverHTTPServer.listen(globalConfig.webserverPort, () => {
      log.info(
        `Web server listening on http://localhost:${globalConfig.webserverPort}/`,
      );
      integrationStates.webserver = true;
    });
  } catch (error) {
    log.error(
      "Error: Could not start web server, please make sure that the port is not in use!",
    );
    log.error("Web Server Error: " + error);
    integrationStates.webserver = false;
  }
}

interface WebServerControlArgs {
  color: {
    r: number;
    g: number;
    b: number;
  };
}

export async function webServerControl({ color }: WebServerControlArgs) {
  webserverIOSocket?.emit("color-change", {
    r: color.r,
    g: color.g,
    b: color.b,
  });
}

export function closeWebServer() {
  webserverHTTPServer?.close();
  webserverIOSocket?.close();
  integrationStates.webserver = false;
}
