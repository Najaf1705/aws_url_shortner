"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendClickEvent = sendClickEvent;
const client_sqs_1 = require("@aws-sdk/client-sqs");
const client = new client_sqs_1.SQSClient({});
async function sendClickEvent(queueUrl, payload) {
    const cmd = new client_sqs_1.SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(payload),
    });
    await client.send(cmd);
}
