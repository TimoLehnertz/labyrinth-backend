import { z } from "zod";
import { Endpoint, JSONValue } from "./Shared";
import type { userEndpoint } from "./Shared";

// type EndpointFetcher<I extends JSONValue, O extends JSONValue> = (
//   request: I
// ) => Promise<O>;

// const fetchUser: EndpointFetcher<UserEndpoint, UserEndpoint>;

type API = {
  getUser: typeof userEndpoint;
};

function makeAPICall<T extends keyof API>(
  path: T,
  data: z.infer<API[T]["requestSchema"]>
): z.infer<API[T]["responseSchema"]> {
  return {} as z.infer<API[T]["responseSchema"]>;
}

const response = makeAPICall("getUser", {
  group: "123",
});

function makeEndpointCall<T extends Endpoint<any, any>>(
  request: Zod.infer<T["requestSchema"]>
): Zod.infer<T["responseSchema"]> {
  return {} as Zod.infer<T["responseSchema"]>;
}

const b = makeEndpointCall<typeof userEndpoint>({ group: "" });
