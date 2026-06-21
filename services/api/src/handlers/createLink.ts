import { validateLongUrl } from "../lib/validate";
import { response } from "../lib/response";
import type { CreateLinkBody } from "../lib/types";
import { getOptionalAuthenticatedUser, getCookie } from "../lib/authUtils";
import { countActiveUserLinks, createLink, toGuestUserId } from "../lib/linkUtils";
import { randomBase62 } from "../lib/base62";

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const MAX_TTL_SECONDS = 60 * 60 * 24 * 365; // 1 year
const MAX_GUEST_LINKS = 3;

export const handler = async (event: any) => {
  const headers = event.headers ?? {};
  const origin = headers.origin ?? headers.Origin;
  console.log("origim: ", origin)

  try {
    const body: CreateLinkBody | null = event?.body
      ? JSON.parse(event.body)
      : null;


    if (!body?.longUrl) {
      return response(
        { message: "LongUrl is required" },
        { statusCode: 400, origin }
      );
    }

    validateLongUrl(body.longUrl);

    const payload = await getOptionalAuthenticatedUser(event);

    // Prefer cookie, then header, then body. If still missing and unauthenticated,
    // generate a guest id server-side and set it as an HttpOnly cookie.
    const cookieGuest = getCookie(event, "shorty-guest-id");
    const headerGuest = headers["shorty-guest-id"] ?? headers["Shorty-Guest-Id"] ?? body?.guestId;
    let guestId = cookieGuest ?? headerGuest ?? null;

    let extraHeaders: Record<string, string> | undefined;

    if (!payload && !guestId) {
      // create server-side guest id
      guestId = randomBase62(16);
      // set cookie for 1 year (secure, cross-site compatible)
      const maxAge = 60 * 60 * 24 * 365; // 1 year in seconds
      extraHeaders = {
        "Set-Cookie": `shorty-guest-id=${guestId}; Domain=.najaf.in; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=None`,
      };
    }

    const userId = payload?.sub ?? toGuestUserId((guestId ?? "").toString());

    if (!payload) {
      const guestLinkCount = await countActiveUserLinks(userId);

      if (guestLinkCount >= MAX_GUEST_LINKS) {
        return response(
          { message: "Login to create more than 3 links" },
          { statusCode: 403, origin }
        );
      }
    }

    const ttl = clamp(
      body.expiresInSeconds ?? DEFAULT_TTL_SECONDS,
      60, // minimum 1 minute
      MAX_TTL_SECONDS
    );

    const expireAt = Math.floor(Date.now() / 1000) + ttl;

    const link = await createLink(
      userId,
      body.longUrl,
      expireAt,
    );

    return response(
      {
        message: "URL generated",
        code: link.code,
        expireAt: link.expireAt,
      },
      { statusCode: 201, origin, headers: extraHeaders }
    );
  } catch (e: any) {
    if (
      e.message === "Invalid URL" ||
      e.message === "URL must start with http:// or https://"
    ) {
      return response(
        { message: "Invalid URL" },
        { statusCode: 401, origin }
      );
    }

    if (
      e.message === "UNAUTHENTICATED" ||
      e.message === "INVALID_TOKEN"
    ) {
      return response(
        { message: "User not authenticated" },
        { statusCode: 401, origin }
      );
    }

    if (e.message === "INVALID_GUEST_ID") {
      return response(
        { message: "Guest session missing" },
        { statusCode: 400, origin }
      );
    }

    if (e.message === "UNABLE_TO_GENERATE_UNIQUE_CODE") {
      return response(
        { message: "Could not generate URL, try again" },
        { statusCode: 503, origin }
      );
    }

    throw e;

  }
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
