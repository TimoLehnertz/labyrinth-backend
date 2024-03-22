/**
 * @author Timo Lehnertz
 */
import { ZodType } from "zod";
import { Request } from "express";
import { ValidationEndpointError } from "../Endpoints/src/EndpointErrors/EndpointErrors";
import { InputValidator } from "../Endpoints/src/Endpoint";

export function zodValidator<T>(zodType: ZodType<T>): InputValidator<T> {
  const validator: InputValidator<T> = (
    request: Request
  ): T | ValidationEndpointError => {
    const requestJson = request.body;
    const result = zodType.safeParse(requestJson);
    if (result.success) {
      return result.data;
    } else {
      return new ValidationEndpointError(result.error);
    }
  };
  return validator;
}
