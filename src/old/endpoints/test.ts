import { Request, Response } from "express";
import { Schema, TypeOf } from "zod";

abstract class AbstractEndpoint<T extends Schema<any>> {
  constructor(protected schema: T) {}

  protected abstract handleValidatedData(
    data: TypeOf<T>,
    req: Request,
    res: Response
  ): Promise<void>;

  public async handleRequest(req: Request, res: Response): Promise<void> {
    try {
      const validatedData: TypeOf<T> = this.schema.parse(req.body);
      await this.handleValidatedData(validatedData, req, res);
    } catch (error) {
      console.error("Validation error:", error);
      res.status(400).json({ error: "Validation error" });
    }
  }
}

// Example usage
import { z } from "zod";

// Define a Zod schema
const userSchema = z.object({
  username: z.string(),
  email: z.string().email(),
});

// Implement a concrete endpoint class
class UserEndpoint extends AbstractEndpoint<typeof userSchema> {
  protected async handleValidatedData(
    data: TypeOf<typeof userSchema>,
    req: Request,
    res: Response
  ): Promise<void> {
    console.log("Validated data:", data);

    // Handle validated data...
    res.json(data);
  }
}

// Use it in your Express route handler
const userEndpoint = new UserEndpoint(userSchema);
