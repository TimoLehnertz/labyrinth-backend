import { JWT } from "next-auth/jwt";
import { AuthenticatedEndpoint } from "./AuthenticatedEndpoint";
import { Request, Response } from "express";
import { TypeOf, z } from "zod";
import prisma from "../../db";

export const removeFriendEndpointSchema = z.object({
  friendID: z.string().min(2),
});

export class RemoveFriendEndpoint extends AuthenticatedEndpoint<
  typeof removeFriendEndpointSchema
> {
  public constructor() {
    super(removeFriendEndpointSchema);
  }

  protected async handleAuthenticated(
    jwt: JWT,
    req: Request,
    res: Response,
    data: TypeOf<typeof removeFriendEndpointSchema>
  ) {
    if (!jwt.sub) {
      res.status(401).send("invalid auth");
      return;
    }
    const users = await prisma.users.findFirst({
      where: {
        id: data.friendID,
      },
    });
    if (!users) {
      res.status(400).send("User doesnt exist");
      return;
    }
    let error = false;
    await prisma.users_are_friends
      .deleteMany({
        where: {
          OR: [
            {
              usera: jwt.sub,
              userb: data.friendID,
            },
            {
              usera: data.friendID,
              userb: jwt.sub,
            },
          ],
        },
      })
      .catch(() => {
        error = true;
      });
    if (error) {
      res.status(500).send("error");
      return;
    }
    res.send("Succsess");
  }
}
