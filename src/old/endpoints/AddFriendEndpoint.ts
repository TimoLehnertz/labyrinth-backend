import { JWT } from "next-auth/jwt";
import { AuthenticatedEndpoint } from "./AuthenticatedEndpoint";
import { Request, Response } from "express";
import { TypeOf, z } from "zod";
import prisma from "../../db";
import { FriendRequestsWebSocket } from "./websockets/FriendRequestsWebSocket";

export const addFriendEndpointSchema = z.object({
  friendName: z.string().min(2),
});

export class AddFriendEndpoint extends AuthenticatedEndpoint<
  typeof addFriendEndpointSchema
> {
  public constructor() {
    super(addFriendEndpointSchema);
  }

  protected async handleAuthenticated(
    jwt: JWT,
    req: Request,
    res: Response,
    data: TypeOf<typeof addFriendEndpointSchema>
  ) {
    console.log(jwt.sub);
    console.log(data.friendName);
    const users = await prisma.users.findMany({
      where: {
        username: data.friendName,
      },
    });
    if (!jwt.sub) {
      res.status(401).send("invalid auth");
      return;
    }
    if (users.length === 0) {
      res.status(400).send("User doesnt exist");
      return;
    }
    const friend = users[0];
    if (friend.id === jwt.sub) {
      res.status(400).send("This is yourself");
      return;
    }
    const existingRequests = await prisma.friend_request.findFirst({
      where: {
        initiator: jwt.sub,
        requested: friend.id,
      },
    });
    if (existingRequests) {
      res.status(400).send("already sent");
      return;
    }
    const friendRequest = await prisma.friend_request
      .create({
        data: {
          requestedat: new Date(),
          initiator: jwt.sub,
          requested: friend.id,
        },
      })
      .catch(() => {
        res.status(500).send("Error");
        return;
      });
    if (friendRequest) {
      FriendRequestsWebSocket.addFriendRequest(friendRequest);
      res.send("Succsess");
    } else {
      res.status(500).send("Error");
    }
  }
}
