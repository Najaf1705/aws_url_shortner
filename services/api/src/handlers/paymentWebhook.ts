import crypto from "crypto";
import "dotenv/config";
import { response } from "../lib/response";
import { ddb } from "../lib/dynamo";
import { config } from "../lib/config";
import { completePayment } from "../lib/premium";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

const verifySignature = (rawBody: string, signatureHeader: string | undefined) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret || !signatureHeader) return false;
  const generated = crypto.createHmac("sha256", keySecret).update(rawBody).digest("hex");
  return generated === String(signatureHeader).trim();
};

export const handler = async (event: any) => {
  const headers = event.headers ?? {};
  const origin = headers.origin ?? headers.Origin;

  try {
    const rawBody = typeof event.body === "string" ? event.body : JSON.stringify(event.body ?? {});
    const signatureHeader = headers["x-razorpay-signature"] ?? headers["X-Razorpay-Signature"];

    if (!verifySignature(rawBody, signatureHeader)) {
      console.warn("Webhook signature verification failed");
      return response({ message: "Invalid webhook signature" }, { statusCode: 400, origin });
    }

    const payload = JSON.parse(rawBody || "{}");
    const eventType = payload?.event;

    // Extract common fields
    const paymentEntity = payload?.payload?.payment?.entity;
    const orderEntity = payload?.payload?.order?.entity;

    const razorpayOrderId = paymentEntity?.order_id ?? orderEntity?.id;
    const razorpayPaymentId = paymentEntity?.id ?? null;

    if (!razorpayOrderId) {
      // Nothing to link to our payments
      return response({ message: "Webhook received" }, { statusCode: 200, origin });
    }

    // Find our payment record by razorpayOrderId (scan - acceptable for low volume)
    const scanRes = await ddb.send(
      new ScanCommand({
        TableName: config.paymentsTableName,
        FilterExpression: "razorpayOrderId = :oid",
        ExpressionAttributeValues: { 
          ":oid": razorpayOrderId,
        },
        Limit: 1,
      })
    );

    const found = Array.isArray(scanRes.Items) && scanRes.Items.length > 0 ? scanRes.Items[0] as any : null;

    if (!found) {
      // No matching payment record; nothing else to do
      console.warn("No payment record found for order", razorpayOrderId);
      return response({ message: "Webhook received" }, { statusCode: 200, origin });
    }

    const ourPaymentId = found.paymentId as string;

    // Mark payment completed and store razorpay ids
    try {
      await completePayment(ourPaymentId, {
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId ?? undefined,
        razorpaySignature: String(signatureHeader ?? ""),
      });
    } catch (err) {
      console.error("Failed to complete payment from webhook:", err);
    }

    return response({ message: "Webhook processed" }, { statusCode: 200, origin });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return response({ message: "Webhook processing failed" }, { statusCode: 500, origin });
  }
};
