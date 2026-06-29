import Razorpay from "razorpay";
import "dotenv/config";
import { response } from "../lib/response";

const parseBody = (body: unknown) => {
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }

  return body ?? {};
};

export const handler = async (event: any) => {
  const headers = event.headers ?? {};
  const origin = headers.origin ?? headers.Origin;

  try {
    const body = parseBody(event.body);
    const amount = Number(body?.amount);
    const currency = body?.currency ?? "INR";
    // Allow passing a paymentId so we can link the Razorpay order to our payment record
    const paymentId = typeof body?.paymentId === "string" && body.paymentId.trim() ? body.paymentId.trim() : undefined;
    const receipt = paymentId ?? body?.receipt ?? `shorty-${Date.now()}`;

    if (!Number.isFinite(amount) || amount < 100) {
      return response(
        { message: "Amount must be at least 100 paise" },
        { statusCode: 400, origin }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return response(
        { message: "Razorpay is not configured" },
        { statusCode: 500, origin }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
      notes: {
        source: "shorty",
      },
    });

    // If a paymentId was provided, link the created Razorpay order id to our payment record
    if (paymentId) {
      try {
        const { UpdateCommand } = await import("@aws-sdk/lib-dynamodb");
        const { ddb } = await import("../lib/dynamo");
        const { config } = await import("../lib/config");

        await ddb.send(
          new UpdateCommand({
            TableName: config.paymentsTableName,
            Key: { paymentId },
            UpdateExpression: "SET razorpayOrderId = :oid",
            ExpressionAttributeValues: {
              ":oid": order.id,
            },
          })
        );
      } catch (err) {
        console.error("Failed to link paymentId to Razorpay order:", err);
      }
    }

    const checkoutUrl = `https://rzp.io/i/${order.id}`;

    return response(
      {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        checkout_url: checkoutUrl,
      },
      { statusCode: 200, origin }
    );
  } catch (error: any) {
    console.error("Razorpay create order error:", error);

    if (error?.statusCode === 401) {
      return response(
        { message: "Razorpay authentication failed" },
        { statusCode: 401, origin }
      );
    }

    return response(
      { message: "Failed to create Razorpay order" },
      { statusCode: 500, origin }
    );
  }
};
