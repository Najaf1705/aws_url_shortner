"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const handler = async (event) => {
    // SQS batch
    const records = event?.Records ?? [];
    for (const r of records) {
        try {
            const msg = JSON.parse(r.body);
            console.log("click-event", msg);
        }
        catch (e) {
            console.error("bad message", r.body);
            // throw to trigger retry if you want strictness; for phase1, just log
        }
    }
    return {};
};
exports.handler = handler;
