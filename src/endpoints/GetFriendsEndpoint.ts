import { JWT } from "next-auth/jwt";
import { AuthenticatedEndpoint } from "./AuthenticatedEndpoint";
import { Request, Response } from "express";
import { TypeOf, z } from "zod";
import prisma from "../db";
import { FriendRequestsWebSocket } from "./websockets/FriendRequestsWebSocket";

export const getFriendEndpointSchema = z.object({});

export class GetFriendsEndpoint extends AuthenticatedEndpoint<
  typeof getFriendEndpointSchema
> {
  public constructor() {
    super(getFriendEndpointSchema);
  }

  protected async handleAuthenticated(
    jwt: JWT,
    req: Request,
    res: Response,
    data: TypeOf<typeof getFriendEndpointSchema>
  ) {
    if (!jwt.sub) {
      res.status(401).send("invalid auth");
      return;
    }
    let error = false;
    const dbFriends1 = await prisma.users_are_friends
      .findMany({
        where: {
          usera: jwt.sub,
        },
        include: {
          users_users_are_friends_userbTousers: true,
        },
      })
      .catch(() => {
        error = true;
      });
    if (error) {
      res.status(500).send("Error");
      return;
    }
    const dbFriends2 = await prisma.users_are_friends
      .findMany({
        where: {
          userb: jwt.sub,
        },
        include: {
          users_users_are_friends_useraTousers: true,
        },
      })
      .catch(() => {
        error = true;
      });
    if (error) {
      res.status(500).send("Error");
      return;
    }
    const friends = [];
    for (const dbFriend of dbFriends1 ?? []) {
      friends.push({
        friendUsername: dbFriend.users_users_are_friends_userbTousers.username,
        friendID: dbFriend.users_users_are_friends_userbTousers.id,
        since: dbFriend.since,
      });
    }
    for (const dbFriend of dbFriends2 ?? []) {
      friends.push({
        friendUsername: dbFriend.users_users_are_friends_useraTousers.username,
        friendID: dbFriend.users_users_are_friends_useraTousers.id,
        since: dbFriend.since,
      });
    }
    res.send(JSON.stringify(friends));
  }
}
