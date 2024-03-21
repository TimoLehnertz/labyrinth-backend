type Validator<T> = (request?: Request) => T;

type ValidationObject<T extends Record<string, Validator<any>> | undefined> = {
  [K in keyof T]: T[K] extends Validator<infer U> ? U : never;
};

function validateObject<T extends Record<string, Validator<any>> | undefined>(
  obj: T,
  request?: Request
): ValidationObject<T> {
  const result: Partial<ValidationObject<T>> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const validator = obj[key];
      if (validator) {
        result[key as keyof T] = validator(request); // as any; // Validating null for simplicity, replace with appropriate value
      }
    }
  }

  return result as ValidationObject<T>;
}

const validators = {
  prop1: (data: any) => (typeof data === "string" ? data : null),
  prop2: (data: any) => (typeof data === "number" ? data : ""),
  prop3: (data: any) => (typeof data === "boolean" ? data : null),
  prop4: (data: any) => (Array.isArray(data) ? data : null),
};

const result = validateObject(validators);
