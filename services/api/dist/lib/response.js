"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.json = json;
function json(statusCode, body) {
    return {
        statusCode,
        headers: {
            "content-type": "application/json",
            "cache-control": "no-store",
        },
        body: JSON.stringify(body),
    };
}
