import {
  InputValidator,
  RequestTypeFromRequestEndpoint,
  TypeFromRequestValidator,
} from "../Endpoints/src/Endpoint";
import type { Endpoints } from "../Labyrinth-Endpoint-Definitions/EndpointDefinitions";

// type EndpointFetcher<I extends JSONValue, O extends JSONValue> = (
//   request: I
// ) => Promise<O>;

// const fetchUser: EndpointFetcher<UserEndpoint, UserEndpoint>;

// type API = {
//   getUser: UserEndpointType;
// };

type WithoutUndefined<T> = T extends undefined ? never : T;

// async function makeAPICall<TEndpoint extends keyof Endpoints>(
//   path: TEndpoint,
//   requestData: RequestTypeFromRequestEndpoint<Endpoints[TEndpoint]>
// ): Promise<WithoutUndefined<Endpoints[TEndpoint]["responseExample"]>> {
//   // data
//   return {} as WithoutUndefined<Endpoints[TEndpoint]["responseExample"]>;
// }

type ExtractRequestValidator<T extends keyof Endpoints> =
  Endpoints[T][keyof Endpoints[T]] extends {
    requestValidator: infer R;
  }
    ? R extends Partial<{ GET: InputValidator<any>; POST: InputValidator<any> }>
      ? R
      : never
    : never;

// Utility type to extract the responseExample type from an endpoint definition
type ExtractResponseExample<T extends keyof Endpoints> =
  Endpoints[T][keyof Endpoints[T]] extends {
    responseExample?: infer R;
  }
    ? R
    : never;

type APIResponse<T> = { succsess: false } | { succsess: true; data: T };

// Now you can use ExtractRequestValidator to get the request validator type
async function makeAPICall<
  TEndpoint extends keyof Endpoints,
  TMethod extends keyof Endpoints[TEndpoint]
>(
  path: TEndpoint,
  method: TMethod,
  requestData: TypeFromRequestValidator<ExtractRequestValidator<TEndpoint>>
): Promise<APIResponse<ExtractResponseExample<TEndpoint>>> {
  try {
    const response = await fetch(path, {
      method: method as string,
      body: (requestData as { POST: string }).POST,
      credentials: "include",
      headers: new Headers({ "content-type": "application/json" }),
    });
    if (response.status >= 200 && response.status < 300) {
      const jsonResponse = await response.json();
      return {
        succsess: true,
        data: jsonResponse,
      };
    } else {
      return {
        succsess: false,
      };
    }
  } catch (e) {
    return {
      succsess: false,
    };
  }
}

async function test() {
  const response1 = await makeAPICall("addFriend", "GET", {
    POST: {
      friendId: "",
    },
  });
  if (response1.succsess) {
    response1.data;
  }
}
