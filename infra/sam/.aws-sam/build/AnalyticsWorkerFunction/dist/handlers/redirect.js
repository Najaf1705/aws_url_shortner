"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const dynamo_1 = require("../lib/dynamo");
const config_1 = require("../lib/config");
const sqs_1 = require("../lib/sqs");
const handler = async (event) => {
    const code = event?.pathParameters?.code;
    if (!code)
        return notFound();
    try {
        const res = await dynamo_1.ddb.send(new lib_dynamodb_1.GetCommand({
            TableName: config_1.config.urlTableName,
            Key: { code },
        }));
        const item = res.Item;
        if (!item)
            return notFound();
        const nowEpoch = Math.floor(Date.now() / 1000);
        if (typeof item.expireAt === "number" && item.expireAt <= nowEpoch) {
            return notFound(); // treat expired as not found
        }
        // Best-effort async analytics event
        if (config_1.config.clickQueueUrl) {
            const clickEvent = {
                code,
                ts: new Date().toISOString(),
                ip: event?.requestContext?.http?.sourceIp, // available in HTTP API
                ua: event?.headers?.["user-agent"] ?? event?.headers?.["User-Agent"],
            };
            // Don't await in a way that risks slowing redirect if SQS is slow.
            // But Lambda may freeze quickly; safest is to await with short timeout in later phases.
            (0, sqs_1.sendClickEvent)(config_1.config.clickQueueUrl, clickEvent).catch((e) => console.error("Failed to enqueue click event", e));
        }
        return {
            statusCode: 302,
            headers: {
                Location: item.longUrl,
                "cache-control": "no-store",
            },
            body: "",
        };
    }
    catch (e) {
        console.error("redirect error", e);
        return {
            statusCode: 500,
            headers: { "cache-control": "no-store" },
            body: "Internal error",
        };
    }
};
exports.handler = handler;
function notFound() {
    return {
        statusCode: 404,
        headers: { "cache-control": "no-store" },
        body: "Not found",
    };
}
