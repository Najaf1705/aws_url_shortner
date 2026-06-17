import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/dynamo";
import { config } from "../lib/config";
import { getAuthenticatedUser } from "../lib/authUtils";
import { response } from "../lib/response";

export const handler = async (event: any) => {
    const origin = event.headers.origin ?? event.headers.Origin;

    try {
        const payload = await getAuthenticatedUser(event);
        const userId = payload.sub;

        console.log({
            table: config.urlTableName,
            userId,
            type: typeof userId,
        });

        const res = await ddb.send(
            new QueryCommand({
                TableName: config.urlTableName,
                IndexName: "UserIdIndex",
                KeyConditionExpression: "userId = :userId",
                ExpressionAttributeValues: {
                    ":userId": userId,
                },
            })
        );

        console.log("user dets: ", res.Items)

        return response(
            {
                message: "User Links",
                links: res.Items,
            },
            { statusCode: 201, origin }
        );


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