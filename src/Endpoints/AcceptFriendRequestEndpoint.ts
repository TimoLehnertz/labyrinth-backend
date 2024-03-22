import { jwtAuthenticator } from "../Authenticators/JwtAuthenticator";
import prisma from "../db";
import {
  AbstractAcceptFriendRequestEndpoint,
  AcceptFriendRequestEndpointRequestFormat,
  AcceptFriendRequestEndpointResponse,
  AcceptFriendRequestEndpointValidator,
  AuthenticatedUser,
} from "../Labyrinth-Endpoint-Definitions/EndpointDefinitions";
import { zodValidator } from "../InputValidators/ZodInputValidator";
import { z } from "zod";
import {
  EndpointError,
  TypeFromRequestValidator,
} from "express-api-helper-classes";

export const acceptFriendRequestEndpointValidator: AcceptFriendRequestEndpointValidator =
  {
    POST: zodValidator<AcceptFriendRequestEndpointRequestFormat>(
      z.object({
        requestID: z.string(),
      })
    ),
  };

export class AcceptFriendRequestEndpoint extends AbstractAcceptFriendRequestEndpoint {
  public constructor() {
    super(acceptFriendRequestEndpointValidator, jwtAuthenticator);
  }

  public async runAuthenticated(
    data: TypeFromRequestValidator<AcceptFriendRequestEndpointValidator>,
    user: { id: string; username: string }
  ): Promise<AcceptFriendRequestEndpointResponse | EndpointError<any>> {
    const request = await prisma.friend_request.findFirst({
      where: {
        id: data.POST.requestID,
      },
    });
    if (request === null) {
      return new EndpointError(400, "Request does not exist");
    }
    await prisma.users_are_friends.create({
      data: {
        since: new Date(),
        usera: request.initiator,
        userb: user.id,
      },
    });
    await prisma.friend_request.delete({
      where: {
        id: request.id,
      },
    });
    return {};
  }
}
