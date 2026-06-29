import crypto from "crypto";
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body ?? {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return response(
        { message: "Missing payment verification fields" },
        { statusCode: 400, origin }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return response(
        { message: "Razorpay is not configured" },
        { statusCode: 500, origin }
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expectedSignature = generatedSignature.toLowerCase().trim();
    const actualSignature = String(razorpay_signature).toLowerCase().trim();
    const isValid = expectedSignature === actualSignature;

    if (!isValid) {
      return response(
        { message: "Payment signature verification failed" },
        { statusCode: 400, origin }
      );
    }

    return response(
      {
        message: "Payment verified",
        verified: true,
      },
      { statusCode: 200, origin }
    );
  } catch (error) {
    console.error("Razorpay verify error:", error);
    return response(
      { message: "Failed to verify payment" },
      { statusCode: 500, origin }
    );
  }
};
