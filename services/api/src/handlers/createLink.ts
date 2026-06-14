import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/dynamo";
import { config } from "../lib/config";
import { randomBase62 } from "../lib/base62";
import { validateLongUrl } from "../lib/validate";
import { response } from "../lib/response";
import type { CreateLinkBody, UrlItem } from "../lib/types";
import { verifyAccessToken } from "../lib/jwt";
import { getAuthenticatedUser } from "../lib/authUtils";

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const MAX_TTL_SECONDS = 60 * 60 * 24 * 365; // 1 year
const MAX_RETRIES = 8;

export const handler = async (event: any) => {
  const origin = event.headers.origin ?? event.headers.Origin;

  try {
    const payload = await getAuthenticatedUser(event);
    const userId = payload.sub;

    const body: CreateLinkBody = event?.body ? JSON.parse(event.body) : null;
    if (!body?.longUrl) return response(
      { message: "LongUrl is required" },
      { statusCode: 400, origin }
    );

    validateLongUrl(body.longUrl);

    const ttl = clamp(
      body.expiresInSeconds ?? DEFAULT_TTL_SECONDS,
      60, // minimum 1 minute
      MAX_TTL_SECONDS
    );

    const now = new Date();
    const expireAt = Math.floor(Date.now() / 1000) + ttl;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const code = randomBase62(config.codeLength);

      const item: UrlItem = {
        code,
        clickCount: 0,
        userId,
        longUrl: body.longUrl,
        createdAt: now.toISOString(),
        expireAt,
      };

      try {
        await ddb.send(
          new PutCommand({
            TableName: config.urlTableName,
            Item: item,
            ConditionExpression: "attribute_not_exists(#code)",
            ExpressionAttributeNames: { "#code": "code" },
          })
        );

        // In Phase 1 we return code; frontend can build shortUrl using API base or custom domain later
        return response(
          { message: "URL generated", code, expireAt },
          { statusCode: 201, origin }
        );
      } catch (err: any) {
        // ConditionalCheckFailedException => collision, retry
        if (err?.name === "ConditionalCheckFailedException") continue;
        throw err;
      }
    }

    return response({ message: "Failed to generate unique code, try again" }, { statusCode: 503, origin });
  } catch (e: any) {
    if (
      e.message === "UNAUTHENTICATED" ||
      e.message === "INVALID_TOKEN"
    ) {
      return response(
        { message: "User not authenticated" },
        { statusCode: 401, origin }
      );
    }

    throw e;

  }
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}