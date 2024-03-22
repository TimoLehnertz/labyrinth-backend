import { jwtAuthenticator } from "../Authenticators/JwtAuthenticator";
import prisma from "../db";
import {
  AbstractDeleteFriendEndpoint,
  AuthenticatedUser,
  DeleteFriendEndpointRequestFormat,
  DeleteFriendEndpointResponse,
  DeleteFriendEndpointValidator,
} from "../Labyrinth-Endpoint-Definitions/EndpointDefinitions";
import { zodValidator } from "../InputValidators/ZodInputValidator";
import { z } from "zod";
import {
  EndpointError,
  TypeFromRequestValidator,
} from "express-api-helper-classes";

export const deleteFriendEndpointValidator: DeleteFriendEndpointValidator = {
  POST: zodValidator<DeleteFriendEndpointRequestFormat>(
    z.object({
      friendId: z.string(),
    })
  ),
};

export class DeleteFriendEndpoint extends AbstractDeleteFriendEndpoint {
  public constructor() {
    super(deleteFriendEndpointValidator, jwtAuthenticator);
  }

  public async runAuthenticated(
    data: TypeFromRequestValidator<DeleteFriendEndpointValidator>,
    user: AuthenticatedUser
  ): Promise<DeleteFriendEndpointResponse | EndpointError<any>> {
    const relationship = await prisma.users_are_friends.findFirst({
      where: {
        OR: [
          {
            usera: user.id,
            userb: data.POST.friendId,
          },
          {
            usera: data.POST.friendId,
            userb: user.id,
          },
        ],
      },
    });
    if (!relationship) {
      return new EndpointError(400, "Friendship does not exist"); // @todo
    }
    await prisma.users_are_friends.delete({
      where: {
        id: relationship.id,
      },
    });
    return {}; // empty response indicating succsess
  }
}
