import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/dynamo";
import { config } from "../lib/config";

export const handler = async (event: any) => {
  // SQS batch
  const records = event?.Records ?? [];
  for (const r of records) {
    try {
      const msg = JSON.parse(r.body);
      console.log("click-event", msg);
      const code = msg.code;

      await ddb.send(
        new UpdateCommand({
          TableName: config.urlTableName,
          Key: { code },
          UpdateExpression:
            "SET updatedAt = :now ADD clickCount :inc",
          ExpressionAttributeValues: {
            ":inc": 1,
            ":now": Math.floor(Date.now() / 1000),
          },
        })
      );

      console.log("updated analytics for", code);

    } catch (e) {
      console.error("failed processing record");
      console.error("body:", r.body);
      console.error("error:", JSON.stringify(e, null, 2));
    }
  }
  return {};
};