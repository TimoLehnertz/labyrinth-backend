import { JWT, decode } from "next-auth/jwt";

export async function jwtFromCookieHeader(
  cookieHeader?: string
): Promise<JWT | null> {
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

export function getCookie(header: string, name: string): string | null {
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
