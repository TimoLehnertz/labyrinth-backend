import { Request, Response } from "express";
import { stat } from "fs";
import { ZodError, ZodObject, ZodType, z } from "zod";

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONArray
  | JSONObject;

export type JSONArray = JSONValue[];

export interface JSONObject {
  [key: string]: JSONValue;
}

enum HttpStatus {
  OK = 200,
  BAT_REQUEST = 400,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

export class EndpointError<TMessage extends JSONValue> {
  public readonly status: HttpStatus;
  public readonly message: TMessage;

  public constructor(status: HttpStatus, message: TMessage) {
    this.status = status;
    this.message = message;
  }

  public sendErrorResponse(response: Response) {
    response.status(this.status).send(JSON.stringify(this.message));
  }
}

export class ValidationEndpointError extends EndpointError<string> {
  public constructor(zodError: ZodError) {
    super(HttpStatus.BAT_REQUEST, "Validation failes"); // @todo
  }
}

export class ExceptionEndpointError extends EndpointError<string> {
  public constructor(error: any) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error"); // @todo
  }
}

enum InputMethod {
  GET = "GET",
  POST = "POST",
}

type InputValidator<T> = (request: Request) => T | ValidationEndpointError;

type RequestValidator = Partial<{
  [key in keyof InputMethod]: InputValidator<any>;
}>;

type TypeFromRequestValidator<T extends RequestValidator> = {
  [K in keyof T]: T[K] extends InputValidator<infer R> ? R : never;
};

export abstract class Endpoint<TData, TResponse> {
  public readonly requestSchema: ZodType<TData>;
  public readonly responseSchema: ZodType<TResponse>;

  public constructor(
    requestSchema: ZodType<TData>,
    responseSchema: ZodType<TResponse>
  ) {
    this.requestSchema = requestSchema;
    this.responseSchema = responseSchema;
  }

  private validate(request: Request): TData | ValidationEndpointError {
    const result = this.requestSchema.safeParse(request.body.json());
    if (!result.success) {
      return new ValidationEndpointError(result.error);
    } else {
      return result.data;
    }
  }

  public async handle(request: Request, response: Response) {
    try {
      const validation = this.validate(request);
      if (validation instanceof ValidationEndpointError) {
        validation.sendErrorResponse(response);
        return;
      }
      const result = await this.run(validation);
      if (result instanceof EndpointError) {
        result.sendErrorResponse(response);
        return;
      }
      response.send(JSON.stringify(result));
    } catch (e) {
      const endpointError = new ExceptionEndpointError(e);
      endpointError.sendErrorResponse(response);
    }
  }

  protected abstract run(data: TData): Promise<TResponse | EndpointError<any>>;
}

export class UserEndpoint extends Endpoint<
  { group: string },
  { username: number }[]
> {
  public constructor() {
    super(
      z.object({ group: z.string() }),
      z.array(z.object({ username: z.number() }))
    );
  }
  protected async run(data: {
    group: string;
  }): Promise<EndpointError<any> | { username: number }[]> {
    return [];
  }
}

export const userEndpoint = new UserEndpoint();

// export const userEndpoint = new Endpoint<{ group: string },
// { username: number }[]>()

// export const userEndpoint: PublicEndpoint<
//   { group: string },
//   { username: number }[]
// > = {
//   requestSchema: z.object({ group: z.string() }),
//   responseSchema: z.array(z.object({ username: z.number() })),
//   validate(request: Request) {
//     return {
//       group: "",
//     };
//   },
//   async process(request: { group: string }) {
//     return [
//       {
//         username: 2,
//       },
//     ];
//   },
// };
