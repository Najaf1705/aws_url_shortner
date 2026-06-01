import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/dynamo";
import { config } from "../lib/config";
import { sendClickEvent } from "../lib/sqs";

export const handler = async (event: any) => {
  const code = event?.pathParameters?.code;
  console.log("CODE IS ==> ", code);
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
  const YOUR_WEBSITE_URL = "https://shorty.najaf.in"; // <-- change this

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Link not found</title>
  <style>
    :root { color-scheme: light; }
    body {
      margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
      background: #fff; color: #111;
      display: grid; place-items: center; min-height: 100vh; padding: 24px;
    }
    .card {
      width: min(560px, 100%);
      border: 2px solid #2b2b2b;
      box-shadow: 0 18px 60px rgba(0,0,0,.18);
      padding: 22px;
    }
    h1 { margin: 0 0 10px; font-size: 28px; }
    p { margin: 0 0 16px; color: #333; line-height: 1.45; }
    .btn {
      display: inline-block;
      border: 2px solid #2b2b2b;
      padding: 10px 16px;
      text-decoration: none;
      color: #111;
      font-weight: 700;
      background: #fff;
    }
    .btn:hover { background: #f3f3f3; }
    .muted { margin-top: 14px; font-size: 12px; color: #666; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
  </style>
</head>
<body>
  <main class="card">
    <h1>Not found</h1>
    <p>This short link doesn’t exist or has expired.</p>
    <a class="btn" href="${YOUR_WEBSITE_URL}" rel="noopener noreferrer">Go to website</a>
    <div class="muted">Error 404 · cache-control: no-store</div>
  </main>
</body>
</html>`;

  return {
    statusCode: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
    body: html,
  };
}