import { friend_request } from "@prisma/client";
import { JWT } from "next-auth/jwt";
import { Namespace, Server, Socket } from "socket.io";
import { AuthenticatedWebSocketEndpoint as AuthenticatedWebSocket } from "./AuthenticatedWebSocket";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import prisma from "../../../db";

export class FriendRequestsWebSocket extends AuthenticatedWebSocket {
  private static instances: FriendRequestsWebSocket[] = [];

  constructor(io: Namespace) {
    super(io);
    FriendRequestsWebSocket.instances.push(this);
  }

  public static addFriendRequest(friendRequest: friend_request): void {
    // for (const instance of FriendRequestsWebSocket.instances) {
    //   instance.io.so
    // }
  }

  protected async onconnection(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    jwt: JWT
  ) {
    if (!jwt.sub) {
      socket.disconnect();
      return;
    }

    const friendRequests = await prisma.friend_request.findMany({
      where: {
        requested: jwt.sub,
      },

      include: {
        users_friend_request_initiatorTousers: true,
      },
    });
    console.log(friendRequests);
    socket.emit("data", JSON.stringify(friendRequests));
    // console.log(`Socket ${socket.id} connected`);
    // socket.on("chatMessage", (message: string) => {
    //   // Handle chat message
    //   console.log(`Received chat message from ${socket.id}: ${message}`);
    //   this.io.emit("chatMessage", message); // Broadcast message to all clients
    // });
  }
}
