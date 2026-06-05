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

    const remainingSeconds = item.expireAt
      ? Math.min(3600, item.expireAt - nowEpoch)
      : 3600;

    console.log("Cache max-age:", remainingSeconds);

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
        "Cache-Control": `public, max-age=${remainingSeconds}`,
        "x-levi-test": "v2",
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
    statusCode: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
    body: `
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Link unavailable</title>

    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            background: #0f172a;
            color: #f8fafc;
            font-family: Inter, system-ui, sans-serif;
        }

        .card {
            width: 100%;
            max-width: 600px;
            background: #111827;
            border: 1px solid #1f2937;
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            box-shadow:
                0 20px 40px rgba(0, 0, 0, .35),
                inset 0 1px 0 rgba(255, 255, 255, .05);
        }

        .icon {
            font-size: 64px;
            margin-bottom: 16px;
        }

        h1 {
            font-size: 2rem;
            margin-bottom: 12px;
        }

        p {
            color: #94a3b8;
            line-height: 1.6;
            margin-bottom: 28px;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            background: #2563eb;
            color: white;
            padding: 12px 24px;
            border-radius: 10px;
            font-weight: 600;
            transition: .2s ease;
        }

        .btn:hover {
            background: #1d4ed8;
            transform: translateY(-1px);
        }

        .footer {
            margin-top: 24px;
            color: #64748b;
            font-size: 0.875rem;
        }

        code {
            background: #0f172a;
            padding: 2px 8px;
            border-radius: 6px;
            color: #cbd5e1;
        }
    </style>
</head>

<body>
    <div class="card">
        <div class="icon">🔗</div>

        <h1>Link unavailable</h1>

        <p>
            This short link doesn't exist, has expired,
            or was removed by its creator.
        </p>

        <a href="https://shorty.najaf.in" class="btn" rel="noopener noreferrer">
            Back to Shorty
        </a>

        <div class="footer">
            Error <code>404</code>
        </div>
    </div>
</body>
</html>
`,
  };
}