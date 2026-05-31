"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLongUrl = validateLongUrl;
function validateLongUrl(longUrl) {
    let u;
    try {
        u = new URL(longUrl);
    }
    catch {
        throw new Error("Invalid URL");
    }
    if (u.protocol !== "http:" && u.protocol !== "https:") {
        throw new Error("URL must start with http:// or https://");
    }
}
