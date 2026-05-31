"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomBase62 = randomBase62;
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
function randomBase62(length) {
    // Node 20+: use crypto.getRandomValues via global crypto
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    let out = "";
    for (let i = 0; i < length; i++) {
        out += ALPHABET[bytes[i] % ALPHABET.length];
    }
    return out;
}
