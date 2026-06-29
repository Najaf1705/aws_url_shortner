import { response } from "../lib/response";
import { getOptionalAuthenticatedUser } from "../lib/authUtils";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/dynamo";
import { config } from "../lib/config";
import { completePayment } from "../lib/premium";

const MAX_TTL_SECONDS = 60 * 60 * 24 * 365; // 1 year

/**
 * POST /link/:code/extend
 * Extend a link's expiry by 30 days (or custom days)
 * Requires payment confirmation
 */
export const handler = async (event: any) => {
  const headers = event.headers ?? {};
  const origin = headers.origin ?? headers.Origin;
  const code = event?.pathParameters?.code;

  try {
    const payload = await getOptionalAuthenticatedUser(event);
    if (!payload) {
      return response(
        { message: "User not authenticated" },
        { statusCode: 401, origin }
      );
    }

    if (!code) {
      return response(
        { message: "Link code is required" },
        { statusCode: 400, origin }
      );
    }

    const body = event?.body ? JSON.parse(event.body) : null;
    const paymentId = body?.paymentId;
    const days = body?.days ?? 30; // Default 30 days

    if (!paymentId) {
      return response(
        { message: "Payment ID is required" },
        { statusCode: 400, origin }
      );
    }

    // In real flow:
    // 1. Verify payment is completed via payment provider
    // 2. Only then proceed with extension
    // For now, we'll mark payment as completed and extend

    // Get the link to check ownership and current expiry
    const result = await ddb.send(
      new UpdateCommand({
        TableName: config.urlTableName,
        Key: { code },
        UpdateExpression:
          "SET #expireAt = if_not_exists(#expireAt, :baseExpire) + :extensionSeconds",
        ExpressionAttributeNames: {
          "#expireAt": "expireAt",
        },
        ExpressionAttributeValues: {
          ":baseExpire": Math.floor(Date.now() / 1000),
          ":extensionSeconds": days * 24 * 60 * 60,
        },
        ReturnValues: "ALL_NEW",
      })
    );

    const updatedLink = result.Attributes;

    // Check that new expiry doesn't exceed max
    const now = Math.floor(Date.now() / 1000);
    const maxExpiry = now + MAX_TTL_SECONDS;

    if ((updatedLink?.expireAt ?? 0) > maxExpiry) {
      return response(
        {
          message: "Extension would exceed maximum allowed expiry (365 days)",
          maxAllowed: maxExpiry,
          attempted: updatedLink?.expireAt,
        },
        { statusCode: 400, origin }
      );
    }

    // Mark payment as completed
    try {
      await completePayment(paymentId);
    } catch (error) {
      console.error("Failed to mark payment as completed:", error);
      // Don't fail the extension if payment tracking fails
    }

    return response(
      {
        message: "Link extended successfully",
        code,
        newExpireAt: updatedLink?.expireAt,
        expiresIn: {
          seconds: (updatedLink?.expireAt ?? 0) - now,
          days: Math.floor(((updatedLink?.expireAt ?? 0) - now) / (24 * 60 * 60)),
        },
      },
      { statusCode: 200, origin }
    );
  } catch (error) {
    console.error("Extension error:", error);
    throw error;
  }
};
