import { jwtAuthenticator } from "../Authenticators/JwtAuthenticator";
import prisma from "../db";
import {
  AbstractAddFriendEndpoint,
  AddFriendEndpointResponse,
  AddFriendEndpointValidator,
  AuthenticatedUser,
} from "../Labyrinth-Endpoint-Definitions/EndpointDefinitions";
import { zodValidator } from "../InputValidators/ZodInputValidator";
import { z } from "zod";
import {
  EndpointError,
  TypeFromRequestValidator,
} from "express-api-helper-classes";

export const addFriendEndpointValidator: AddFriendEndpointValidator = {
  POST: zodValidator(
    z.object({
      friendId: z.string(),
    })
  ),
};

export class AddFriendEndpoint extends AbstractAddFriendEndpoint {
  public constructor() {
    super(addFriendEndpointValidator, jwtAuthenticator);
  }

  public async runAuthenticated(
    data: TypeFromRequestValidator<AddFriendEndpointValidator>,
    user: AuthenticatedUser
  ): Promise<AddFriendEndpointResponse | EndpointError<any>> {
    const friendUser = await prisma.users.findFirst({
      where: {
        id: data.POST.friendId,
      },
    });
    if (!friendUser) {
      return new EndpointError(400, "user does not exist"); // @todo
    }
    if (friendUser.id === user.id) {
      return new EndpointError(400, "This is yourself"); // @todo
    }
    const existingRequests = await prisma.friend_request.findFirst({
      where: {
        OR: [
          {
            initiator: user.id,
            requested: friendUser.id,
          },
          {
            initiator: friendUser.id,
            requested: user.id,
          },
        ],
      },
    });
    if (existingRequests) {
      return new EndpointError(400, "already sent"); // @todo
    }
    await prisma.friend_request.create({
      data: {
        requestedat: new Date(),
        initiator: friendUser.id,
        requested: user.id,
      },
    });
    return { hello: "hello" }; // empty response indicating succsess
  }
}
