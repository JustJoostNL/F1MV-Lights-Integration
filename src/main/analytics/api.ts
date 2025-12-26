import log from "electron-log";

const socketUrl = "wss://api.jstt.me/socket/ws";

export class UserAnalytics {
  private static socket: WebSocket | null = null;
  private static clientId: string | null = null;
  private static heartbeatInterval: NodeJS.Timeout | null = null;
  private static isReconnecting: boolean = false;

  static startAnalytics() {
    // Prevent multiple connections
    if (this.socket) return;

    this.connect();
  }

  private static connect() {
    this.socket = new WebSocket(socketUrl);

    this.socket.addEventListener("open", () => {
      this.isReconnecting = false;
      this.socket!.send(
        JSON.stringify({
          route: "user_analytics",
          payload: { app_id: "f1mvli", action: "register" },
        }),
      );
    });

    this.socket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.client_id) {
          this.clientId = data.client_id;
          this.startHeartbeat();
        }
      } catch (error) {
        log.error("Failed to parse analytics message: " + error);
      }
    });

    this.socket.addEventListener("error", (error) => {
      log.error("WebSocket error: " + error);
    });

    this.socket.addEventListener("close", () => {
      this.cleanup(false);
      if (!this.isReconnecting) {
        this.reconnect();
      }
    });
  }

  private static startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN && this.clientId) {
        this.socket.send(
          JSON.stringify({
            route: "user_analytics",
            payload: {
              app_id: "f1mvli",
              action: "heartbeat",
              client_id: this.clientId,
            },
          }),
        );
      }
    }, 30000); // 30 seconds
  }

  private static reconnect() {
    this.isReconnecting = true;
    setTimeout(() => {
      log.info("Reconnecting to analytics...");
      this.connect();
    }, 5000);
  }

  private static cleanup(clearClientId: boolean = true) {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (clearClientId) {
      this.clientId = null;
    }

    this.socket = null;
  }

  static async stopAnalytics(): Promise<void> {
    return new Promise((resolve) => {
      if (this.socket?.readyState === WebSocket.OPEN && this.clientId) {
        this.socket.send(
          JSON.stringify({
            route: "user_analytics",
            payload: {
              app_id: "f1mvli",
              action: "unregister",
              client_id: this.clientId,
            },
          }),
        );

        setTimeout(() => {
          this.isReconnecting = true;
          this.socket?.close();
          this.cleanup();
          resolve();
        }, 100);
      } else {
        this.isReconnecting = true;
        this.socket?.close();
        this.cleanup();
        resolve();
      }
    });
  }

  static getClientId(): string | null {
    return this.clientId;
  }
}
