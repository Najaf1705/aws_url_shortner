import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/dynamo";
import { config } from "../lib/config";
import { randomBase62 } from "../lib/base62";
import { validateLongUrl } from "../lib/validate";
import { json } from "../lib/response";
import type { CreateLinkBody, UrlItem } from "../lib/types";

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const MAX_TTL_SECONDS = 60 * 60 * 24 * 365; // 1 year
const MAX_RETRIES = 8;

export const handler = async (event: any) => {
  try {
    const body: CreateLinkBody = event?.body ? JSON.parse(event.body) : null;
    if (!body?.longUrl) return json(400, { message: "longUrl is required" });

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
        return json(201, { code, expireAt });
      } catch (err: any) {
        // ConditionalCheckFailedException => collision, retry
        if (err?.name === "ConditionalCheckFailedException") continue;
        throw err;
      }
    }

    return json(503, { message: "Failed to generate unique code, try again" });
  } catch (e: any) {
    console.error("createLink error", e);
    return json(500, { message: "Internal error" });
  }
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}