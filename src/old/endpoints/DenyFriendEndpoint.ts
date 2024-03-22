import { JWT } from "next-auth/jwt";
import { AuthenticatedEndpoint } from "./AuthenticatedEndpoint";
import { Request, Response } from "express";
import { TypeOf, z } from "zod";
import prisma from "../../db";

export const denyFriendEndpointSchema = z.object({
  requestId: z.string(),
});

export class DenyFriendEndpoint extends AuthenticatedEndpoint<
  typeof denyFriendEndpointSchema
> {
  public constructor() {
    super(denyFriendEndpointSchema);
  }

  protected async handleAuthenticated(
    jwt: JWT,
    req: Request,
    res: Response,
    data: TypeOf<typeof denyFriendEndpointSchema>
  ) {
    if (!jwt.sub) {
      res.status(401).send("invalid auth");
      return;
    }
    const friend_request = await prisma.friend_request.findFirst({
      where: {
        id: data.requestId,
        requested: jwt.sub,
      },
    });
    if (!friend_request) {
      res.status(400).send("Request doesnt exist");
      return;
    }
    await prisma.friend_request
      .delete({
        where: {
          id: friend_request.id,
        },
      })
      .catch(() => {
        res.status(500).send("Error");
        return;
      });
    res.status(200).send("succsess");
    return;
  }
}
