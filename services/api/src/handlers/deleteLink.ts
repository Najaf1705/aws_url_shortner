import { DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/dynamo";
import { config } from "../lib/config";
import { response } from "../lib/response";
import { getOptionalAuthenticatedUser, getCookie } from "../lib/authUtils";
import { toGuestUserId } from "../lib/linkUtils";

export const handler = async (event: any) => {
  const headers = event.headers ?? {};
  const origin = headers.origin ?? headers.Origin;
  const method = event?.requestContext?.http?.method ?? event?.requestContext?.httpMethod;

  if (method === "OPTIONS") {
    return response({ message: "OK" }, { statusCode: 204, origin });
  }

  const code = event?.pathParameters?.code;

  if (!code) {
    return response({ message: "Code required" }, { statusCode: 400, origin });
  }

  try {
    const payload = await getOptionalAuthenticatedUser(event);
    const cookieGuest = getCookie(event, "shorty-guest-id");
    const headerGuest = headers["shorty-guest-id"] ?? headers["Shorty-Guest-Id"];
    const guestId = cookieGuest ?? headerGuest ?? null;
    const requesterUserId = payload?.sub ?? (guestId ? toGuestUserId(guestId) : null);

    if (!requesterUserId) {
      return response({ message: "User not authenticated" }, { statusCode: 401, origin });
    }

    const linkRes = await ddb.send(
      new GetCommand({
        TableName: config.urlTableName,
        Key: { code },
      })
    );

    const item = linkRes.Item as any | undefined;

    if (!item) {
      return response({ message: "Not found" }, { statusCode: 404, origin });
    }

    if (item.userId !== requesterUserId) {
      return response({ message: "Forbidden" }, { statusCode: 403, origin });
    }

    await ddb.send(
      new DeleteCommand({
        TableName: config.urlTableName,
        Key: { code },
      })
    );

    return response({ message: "Link deleted" }, { statusCode: 200, origin });
  } catch (e: any) {
    if (e.message === "INVALID_TOKEN") {
      return response({ message: "User not authenticated" }, { statusCode: 401, origin });
    }

    if (e.message === "INVALID_GUEST_ID") {
      return response({ message: "Guest session missing" }, { statusCode: 400, origin });
    }

    console.error("deleteLink handler error:", e);
    return response({ message: "Internal error" }, { statusCode: 500, origin });
  }
};
