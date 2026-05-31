import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/dynamo";
import { config } from "../lib/config";
import { sendClickEvent } from "../lib/sqs";

export const handler = async (event: any) => {
  const code = event?.pathParameters?.code;
  if (!code) return notFound();

  try {
    const res = await ddb.send(
      new GetCommand({
        TableName: config.urlTableName,
        Key: { code },
      })
    );

    const item = res.Item as any | undefined;
    if (!item) return notFound();

    const nowEpoch = Math.floor(Date.now() / 1000);
    if (typeof item.expireAt === "number" && item.expireAt <= nowEpoch) {
      return notFound(); // treat expired as not found
    }

    // Best-effort async analytics event
    if (config.clickQueueUrl) {
      const clickEvent = {
        code,
        ts: new Date().toISOString(),
        ip: event?.requestContext?.http?.sourceIp, // available in HTTP API
        ua: event?.headers?.["user-agent"] ?? event?.headers?.["User-Agent"],
      };

      // Don't await in a way that risks slowing redirect if SQS is slow.
      // But Lambda may freeze quickly; safest is to await with short timeout in later phases.
      sendClickEvent(config.clickQueueUrl, clickEvent).catch((e) =>
        console.error("Failed to enqueue click event", e)
      );
    }

    return {
      statusCode: 302,
      headers: {
        Location: item.longUrl,
        "cache-control": "no-store",
      },
      body: "",
    };
  } catch (e) {
    console.error("redirect error", e);
    return {
      statusCode: 500,
      headers: { "cache-control": "no-store" },
      body: "Internal error",
    };
  }
};

function notFound() {
  return {
    statusCode: 404,
    headers: { "cache-control": "no-store" },
    body: "Not found",
  };
}