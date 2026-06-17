import { DeleteCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/dynamo";
import { config } from "../lib/config";
import { UrlItem } from "./types";
import { randomBase62 } from "./base62";

const MAX_RETRIES = 8;

interface CreateLinkParams {
    userId: string;
    longUrl: string;
    expireAt: number;
}

export const createLink = async (
    userId: string,
    longUrl: string,
    expireAt: number,
): Promise<UrlItem> => {
    const now = new Date().toISOString();

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const code = randomBase62(config.codeLength);

        const item: UrlItem = {
            code,
            userId,
            longUrl,
            clickCount: 0,
            createdAt: now,
            expireAt,
        };

        try {
            await ddb.send(
                new PutCommand({
                    TableName: config.urlTableName,
                    Item: item,
                    ConditionExpression: "attribute_not_exists(#code)",
                    ExpressionAttributeNames: {
                        "#code": "code",
                    },
                })
            );

            return item;
        } catch (err: any) {
            if (err?.name === "ConditionalCheckFailedException") {
                continue;
            }

            throw err;
        }
    }

    throw new Error("UNABLE_TO_GENERATE_UNIQUE_CODE");
};

export const getUserLinks = async (userId: string) => {
    try {
        const result = await ddb.send(
            new QueryCommand({
                TableName: config.urlTableName,
                IndexName: "UserIdIndex",
                KeyConditionExpression: "userId = :userId",
                ExpressionAttributeValues: {
                    ":userId": userId,
                },
            })
        );

        return result.Items ?? [];
    } catch (error) {
        console.error("Failed to fetch user links:", error);
        throw new Error("Unable to fetch user links");
    }
};


// export const deleteLink = async (code: string) => {
//     await ddb.send(
//         new DeleteCommand({
//             TableName: config.urlTableName,
//             KeyConditionExpression: "code = :code",
//             ExpressionAttributeValues: {
//                 ":code": code,
//             },
//         })
//     )
// }