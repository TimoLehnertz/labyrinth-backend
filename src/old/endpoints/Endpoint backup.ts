import { Request, Response } from "express";
import { Schema, TypeOf, z } from "zod";

export abstract class Endpoint<T extends Schema<any>> {
  private schema: T;

  public constructor(schema: T) {
    this.schema = schema;
  }

  public static getCookie(header: string, name: string): string | null {
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

  public process(req: Request, res: Response) {
    const result = this.schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).send("Bad request");
      return;
    }
    this.handle(req, res, result.data);
  }

  protected abstract handle(
    req: Request,
    res: Response,
    data: z.infer<T>
  ): void;
}
