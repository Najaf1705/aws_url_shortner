import { verifyAccessToken } from "./jwt";

export function getCookie(
  event: any,
  name: string
): string | null {
  const cookie = event.cookies?.find(
    (c: string) =>
      c.startsWith(`${name}=`)
  );

  if (!cookie) return null;

  const value = cookie.substring(
    name.length + 1
  );

  return value || null;
}

export async function getAuthenticatedUser(
  event: any
) {
  const token = getCookie(
    event,
    "accessToken"
  );

  if (!token) {
    throw new Error("UNAUTHENTICATED");
  }

  try {
    return await verifyAccessToken(token);
  } catch {
    throw new Error("INVALID_TOKEN");
  }
}