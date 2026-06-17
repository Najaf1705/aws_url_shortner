import { validateLongUrl } from "../lib/validate";
import { response } from "../lib/response";
import type { CreateLinkBody } from "../lib/types";
import { getAuthenticatedUser } from "../lib/authUtils";
import { createLink } from "../lib/linkUtils";

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const MAX_TTL_SECONDS = 60 * 60 * 24 * 365; // 1 year

export const handler = async (event: any) => {
  const origin = event.headers.origin ?? event.headers.Origin;

  try {
    const payload = await getAuthenticatedUser(event);
    const userId = payload.sub;

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
      { statusCode: 201, origin }
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