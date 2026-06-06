import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/dynamo";
import { config } from "../lib/config";
import { sendClickEvent } from "../lib/sqs";

export const handler = async (event: any) => {
  const code = event?.pathParameters?.code;

  console.log("=== REDIRECT REQUEST START ===");
  console.log("Code:", code);
  console.log("Source IP:", event?.requestContext?.http?.sourceIp);
  console.log(
    "User Agent:",
    event?.headers?.["user-agent"] ?? event?.headers?.["User-Agent"]
  );

  if (!code) {
    console.log("No code provided");
    return notFound();
  }

  try {
    console.log("Looking up code in DynamoDB:", code);

    const res = await ddb.send(
      new GetCommand({
        TableName: config.urlTableName,
        Key: { code },
      })
    );

    console.log("DynamoDB response:", JSON.stringify(res));

    const item = res.Item as any | undefined;

    if (!item) {
      console.log("Code not found:", code);
      return notFound();
    }

    console.log("Found item:", JSON.stringify(item));

    const nowEpoch = Math.floor(Date.now() / 1000);

    console.log("Current epoch:", nowEpoch);
    console.log("ExpireAt:", item.expireAt);

    if (
      typeof item.expireAt === "number" &&
      item.expireAt <= nowEpoch
    ) {
      console.log("Link expired");
      return notFound();
    }

    // const remainingSeconds = item.expireAt
    //   ? Math.min(3600, item.expireAt - nowEpoch)
    //   : 3600;

    // console.log("Cache max-age:", remainingSeconds);

    if (config.clickQueueUrl) {
      const clickEvent = {
        code,
        ts: new Date().toISOString(),
        ip: event?.requestContext?.http?.sourceIp,
        ua:
          event?.headers?.["user-agent"] ??
          event?.headers?.["User-Agent"],
      };

      console.log(
        "Sending click event:",
        JSON.stringify(clickEvent)
      );

      sendClickEvent(
        config.clickQueueUrl,
        clickEvent
      )
        .then(() =>
          console.log("Click event queued successfully")
        )
        .catch((e) =>
          console.error(
            "Failed to enqueue click event",
            e
          )
        );
    }

    console.log(
      "Redirecting to:",
      item.longUrl
    );

    return {
      statusCode: 302,
      headers: {
        Location: item.longUrl,
        "Cache-Control": "no-store",
      },
      body: "",
    };
  } catch (e) {
    console.error(
      "Redirect handler error:",
      e
    );

    return {
      statusCode: 500,
      headers: {
        "cache-control": "no-store",
      },
      body: "Internal error",
    };
  }
};

function notFound() {
  return {
    statusCode: 302,
    headers: {
      Location: "https://shorty.najaf.in/not-found",
    },
  };
}