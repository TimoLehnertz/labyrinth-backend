/**
 * @author Timo Lehnertz
 *
 * This file keeps a number of types that can safely be stringified,
 * sent over a connection and parsed back into the original form
 */
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
