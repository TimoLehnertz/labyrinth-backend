import { friend_request } from "@prisma/client";
import { JWT } from "next-auth/jwt";
import { Namespace, Server, Socket } from "socket.io";
import { jwtFromCookieHeader } from "../../../lib/jwt";

export abstract class AuthenticatedWebSocketEndpoint {
  protected io: Namespace;

  constructor(io: Namespace) {
    this.io = io;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on("connection", async (socket: Socket) => {
      const jwt = await jwtFromCookieHeader(socket.request.headers.cookie);
      if (!jwt) {
        socket.disconnect();
        return;
      }
      this.onconnection(socket, jwt);
    });
  }

  protected abstract onconnection(socket: Socket, jwt: JWT): void;
}
