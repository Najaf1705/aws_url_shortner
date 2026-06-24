import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/dynamo";
import { config } from "../lib/config";
import { response } from "../lib/response";

export const handler = async (event: any) => {
  const code = event?.pathParameters?.code;
  const headers = event.headers ?? {};
  const origin = headers.origin ?? headers.Origin;

  if (!code) {
    return response({ message: "Code required" }, { statusCode: 400, origin });
  }

  try {
    const res = await ddb.send(
      new GetCommand({
        TableName: config.urlTableName,
        Key: { code },
      })
    );

    const item = res.Item as any | undefined;

    if (!item) {
      return response({ message: "Not found" }, { statusCode: 404, origin });
    }

    const nowEpoch = Math.floor(Date.now() / 1000);
    if (typeof item.expireAt === "number" && item.expireAt <= nowEpoch) {
      return response({ message: "Not found" }, { statusCode: 404, origin });
    }

    return response({ message: "Link", link: item }, { statusCode: 200, origin });
  } catch (e: any) {
    console.error("getLink handler error:", e);
    return response({ message: "Internal error" }, { statusCode: 500, origin });
  }
};
