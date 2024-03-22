import { jwtAuthenticator } from "../Authenticators/JwtAuthenticator";
import prisma from "../db";
import {
  AbstractGetFriendsEndpoint,
  AuthenticatedUser,
  Friend,
  GetFriendsEndpointResponse,
  GetFriendsEndpointValidator,
} from "../Labyrinth-Endpoint-Definitions/EndpointDefinitions";
import { zodValidator } from "../InputValidators/ZodInputValidator";
import { z } from "zod";
import {
  EndpointError,
  TypeFromRequestValidator,
} from "express-api-helper-classes";

export const getFriendsEndpointValidator: GetFriendsEndpointValidator = {
  POST: zodValidator(z.object({})),
};

export class GetFriendsEndpoint extends AbstractGetFriendsEndpoint {
  public constructor() {
    super(getFriendsEndpointValidator, jwtAuthenticator);
  }

  public async runAuthenticated(
    data: TypeFromRequestValidator<GetFriendsEndpointValidator>,
    user: AuthenticatedUser
  ): Promise<GetFriendsEndpointResponse | EndpointError<any>> {
    const friends1 = await prisma.users_are_friends.findMany({
      where: {
        usera: user.id,
      },
      include: {
        users_users_are_friends_userbTousers: true,
      },
    });
    const friends2 = await prisma.users_are_friends.findMany({
      where: {
        userb: user.id,
      },
      include: {
        users_users_are_friends_useraTousers: true,
      },
    });
    const friends: Friend[] = [];
    for (const friend of friends1) {
      friends.push({
        id: friend.id,
        friendsSince: friend.since.toJSON(),
        username: friend.users_users_are_friends_userbTousers.username,
      });
    }
    for (const friend of friends2) {
      friends.push({
        id: friend.id,
        friendsSince: friend.since.toJSON(),
        username: friend.users_users_are_friends_useraTousers.username,
      });
    }
    return friends;
  }
}
