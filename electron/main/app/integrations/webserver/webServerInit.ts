import { Server } from "socket.io";
import express from "express";
import http from "http";
import { integrationStates, webServerVars } from "../../vars/vars";
import { configVars } from "../../../config/config";
import log from "electron-log";

export default async function webServerInitialize() {
  const webApp = express();
  webServerVars.webServerHTTPServer = http.createServer(webApp);
  webServerVars.webServerIOSocket = new Server(webServerVars.webServerHTTPServer);

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
`
    );
  });
  try {
    webServerVars.webServerHTTPServer.listen(configVars.webServerPort, () => {
      log.info(`Web server listening on http://localhost:${configVars.webServerPort}/`);
      integrationStates.webServerOnline = true;
    });
  } catch (error) {
    log.error("Error: Could not start web server, please make sure that the port is not in use!");
    log.error("Web Server Error: " + error);
    integrationStates.webServerOnline = false;
  }
}