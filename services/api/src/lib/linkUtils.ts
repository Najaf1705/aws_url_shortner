import { PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/dynamo";
import { config } from "../lib/config";
import { UrlItem } from "./types";
import { randomBase62 } from "./base62";

const MAX_RETRIES = 8;
const GUEST_USER_PREFIX = "guest#";
const GUEST_ID_PATTERN = /^[a-zA-Z0-9_-]{12,80}$/;

interface CreateLinkParams {
    userId: string;
    longUrl: string;
    expireAt: number;
}

export const createLink = async (
    userId: string,
    longUrl: string,
    expireAt: number,
    code?: string,
): Promise<UrlItem> => {
    const now = new Date().toISOString();

    // If a code (alias) is provided, attempt a single conditional put and
    // fail fast if the alias already exists.
    if (code) {
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
                throw new Error("ALIAS_TAKEN");
            }

            throw err;
        }
    }

    // Otherwise try generating a unique code.
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const generated = randomBase62(config.codeLength);

        const item: UrlItem = {
            code: generated,
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

export function toGuestUserId(guestId: string) {
    const normalized = guestId.trim();

    if (!GUEST_ID_PATTERN.test(normalized)) {
        throw new Error("INVALID_GUEST_ID");
    }

    return `${GUEST_USER_PREFIX}${normalized}`;
}

export const getUserLinks = async (userId: string): Promise<UrlItem[]> => {
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

        return (result.Items ?? []) as UrlItem[];
    } catch (error) {
        console.error("Failed to fetch user links:", error);
        throw new Error("Unable to fetch user links");
    }
};

export const countActiveUserLinks = async (userId: string) => {
    const now = Math.floor(Date.now() / 1000);
    const links = await getUserLinks(userId);

    return links.filter((link) => link.expireAt > now).length;
};

export const claimGuestLinks = async (
    guestUserId: string,
    userId: string
) => {
    const links = await getUserLinks(guestUserId);
    const now = Math.floor(Date.now() / 1000);
    const activeLinks = links.filter((link) => link.expireAt > now);

    await Promise.all(
        activeLinks.map((link) =>
            ddb.send(
                new UpdateCommand({
                    TableName: config.urlTableName,
                    Key: {
                        code: link.code,
                    },
                    UpdateExpression: "SET userId = :userId",
                    ConditionExpression: "userId = :guestUserId",
                    ExpressionAttributeValues: {
                        ":userId": userId,
                        ":guestUserId": guestUserId,
                    },
                })
            )
        )
    );

    return activeLinks.length;
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
