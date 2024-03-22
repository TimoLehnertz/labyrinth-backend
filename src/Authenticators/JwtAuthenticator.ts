/**
 * @author Timo Lehnertz
 */
import { Request } from "express";
import { AuthenticationEndpointError } from "express-api-helper-classes";
import { JWT, decode } from "next-auth/jwt";
import {
  AuthenticatedUser,
  authenticatedUserSchema,
} from "../Labyrinth-Endpoint-Definitions/EndpointDefinitions";

function getCookie(header: string, name: string): string | null {
  const cookies = header.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name)) {
      const start = cookie.indexOf("=") + 1;
      return cookie.substring(start);
    }
  }
  return null;
}

async function jwtFromCookieHeader(cookieHeader?: string): Promise<JWT | null> {
  if (cookieHeader === undefined) {
    return null;
  }
  const jwtStr = getCookie(cookieHeader, "next-auth.session-token");
  if (jwtStr) {
    const decoded = await decode({
      token: jwtStr,
      secret: process.env.NEXTAUTH_SECRET ?? "",
    });
    return decoded;
  }
  return null;
}

export async function jwtAuthenticator(
  request: Request
): Promise<AuthenticatedUser | AuthenticationEndpointError> {
  const jwt = await jwtFromCookieHeader(request.headers.cookie);
  if (jwt === null) {
    return new AuthenticationEndpointError();
  }
  const user = {
    id: jwt.sub,
    username: jwt.name,
  };
  const result = authenticatedUserSchema.safeParse(user);
  if (!result.success) {
    return new AuthenticationEndpointError();
  }
  return result.data;
}
