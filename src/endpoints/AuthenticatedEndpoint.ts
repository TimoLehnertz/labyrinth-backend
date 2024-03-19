import { Endpoint } from "./Endpoint";
import { JWT, decode } from "next-auth/jwt";
import { Request, Response } from "express";
import { Schema, TypeOf, z } from "zod";

export abstract class AuthenticatedEndpoint<
  T extends Schema<any>
> extends Endpoint<T> {
  public constructor(schema: T) {
    super(schema);
  }

  private static async jwtFromCookieHeader(
    cookieHeader?: string
  ): Promise<JWT | null> {
    if (cookieHeader === undefined) {
      return null;
    }
    const jwtStr = Endpoint.getCookie(cookieHeader, "next-auth.session-token");
    if (jwtStr) {
      const decoded = await decode({
        token: jwtStr,
        secret: process.env.NEXTAUTH_SECRET ?? "",
      });
      return decoded;
    }
    return null;
  }

  public async handle(req: Request, res: Response, data: z.infer<T>) {
    console.log("handle auth");
    const jwt = await AuthenticatedEndpoint.jwtFromCookieHeader(
      req.headers.cookie
    );
    if (!jwt) {
      res.status(400).send("Bad request");
      return;
    }
    this.handleAuthenticated(jwt, req, res, data);
  }

  protected abstract handleAuthenticated(
    jwt: JWT,
    req: Request,
    res: Response,
    data: TypeOf<T>
  ): Promise<void>;
}
