"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    urlTableName: mustGet("URL_TABLE_NAME"),
    clickQueueUrl: process.env.CLICK_QUEUE_URL,
    codeLength: parseInt(process.env.CODE_LENGTH ?? "7", 10),
    logLevel: process.env.LOG_LEVEL ?? "info",
};
function mustGet(key) {
    const v = process.env[key];
    if (!v)
        throw new Error(`Missing required env var: ${key}`);
    return v;
}
