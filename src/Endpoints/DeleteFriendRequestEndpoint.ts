import { jwtAuthenticator } from "../Authenticators/JwtAuthenticator";
import prisma from "../db";
import {
  AbstractAcceptFriendRequestEndpoint,
  AcceptFriendRequestEndpointRequestFormat,
  AcceptFriendRequestEndpointResponse,
  AcceptFriendRequestEndpointValidator,
  AuthenticatedUser,
  DeleteFriendRequestEndpointRequestFormat,
  DeleteFriendRequestEndpointResponse,
  DeleteFriendRequestEndpointValidator,
} from "../Labyrinth-Endpoint-Definitions/EndpointDefinitions";
import { zodValidator } from "../InputValidators/ZodInputValidator";
import { z } from "zod";
import {
  EndpointError,
  TypeFromRequestValidator,
} from "express-api-helper-classes";

export const deleteFriendRequestEndpointValidator: DeleteFriendRequestEndpointValidator =
  {
    POST: zodValidator<DeleteFriendRequestEndpointRequestFormat>(
      z.object({
        requestID: z.string(),
      })
    ),
  };

export class DeleteFriendRequestEndpoint extends AbstractAcceptFriendRequestEndpoint {
  public constructor() {
    super(deleteFriendRequestEndpointValidator, jwtAuthenticator);
  }

  public async runAuthenticated(
    data: TypeFromRequestValidator<DeleteFriendRequestEndpointValidator>,
    user: { id: string; username: string }
  ): Promise<DeleteFriendRequestEndpointResponse | EndpointError<any>> {
    const request = await prisma.friend_request.findFirst({
      where: {
        id: data.POST.requestID,
      },
    });
    if (request === null) {
      return new EndpointError(400, "Request does not exist");
    }
    await prisma.friend_request.delete({
      where: {
        id: request.id,
      },
    });
    return {};
  }
}
