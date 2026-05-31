"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const dynamo_1 = require("../lib/dynamo");
const config_1 = require("../lib/config");
const base62_1 = require("../lib/base62");
const validate_1 = require("../lib/validate");
const response_1 = require("../lib/response");
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const MAX_TTL_SECONDS = 60 * 60 * 24 * 365; // 1 year
const MAX_RETRIES = 8;
const handler = async (event) => {
    try {
        const body = event?.body ? JSON.parse(event.body) : null;
        if (!body?.longUrl)
            return (0, response_1.json)(400, { message: "longUrl is required" });
        (0, validate_1.validateLongUrl)(body.longUrl);
        const ttl = clamp(body.expiresInSeconds ?? DEFAULT_TTL_SECONDS, 60, // minimum 1 minute
        MAX_TTL_SECONDS);
        const now = new Date();
        const expireAt = Math.floor(Date.now() / 1000) + ttl;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            const code = (0, base62_1.randomBase62)(config_1.config.codeLength);
            const item = {
                code,
                longUrl: body.longUrl,
                createdAt: now.toISOString(),
                expireAt,
            };
            try {
                await dynamo_1.ddb.send(new lib_dynamodb_1.PutCommand({
                    TableName: config_1.config.urlTableName,
                    Item: item,
                    ConditionExpression: "attribute_not_exists(#code)",
                    ExpressionAttributeNames: { "#code": "code" },
                }));
                // In Phase 1 we return code; frontend can build shortUrl using API base or custom domain later
                return (0, response_1.json)(201, { code, expireAt });
            }
            catch (err) {
                // ConditionalCheckFailedException => collision, retry
                if (err?.name === "ConditionalCheckFailedException")
                    continue;
                throw err;
            }
        }
        return (0, response_1.json)(503, { message: "Failed to generate unique code, try again" });
    }
    catch (e) {
        console.error("createLink error", e);
        return (0, response_1.json)(500, { message: "Internal error" });
    }
};
exports.handler = handler;
function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}
