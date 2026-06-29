import { response } from "../lib/response";
import { getOptionalAuthenticatedUser } from "../lib/authUtils";
import { createPayment } from "../lib/premium";

/**
 * POST /payment/initiate
 * Create a payment order for extra links or extension
 */
export const handler = async (event: any) => {
  const headers = event.headers ?? {};
  const origin = headers.origin ?? headers.Origin;

  try {
    const payload = await getOptionalAuthenticatedUser(event);
    if (!payload) {
      return response(
        { message: "User not authenticated" },
        { statusCode: 401, origin }
      );
    }

    const body = event?.body ? JSON.parse(event.body) : null;
    if (!body?.purpose) {
      return response(
        { message: "Purpose is required (extra-link, alias-creation, or extend-30days)" },
        { statusCode: 400, origin }
      );
    }

    const validPurposes = ['extra-link', 'alias-creation', 'extend-30days'];
    if (!validPurposes.includes(body.purpose)) {
      return response(
        { message: `Invalid purpose. Must be one of: ${validPurposes.join(', ')}` },
        { statusCode: 400, origin }
      );
    }

    // Determine amount based on purpose
    let amount = 1; // ₹1 for all purposes
    if (body.purpose === 'extend-30days' && body.days) {
      amount = Math.ceil((body.days / 30) * 1); // ₹1 per 30 days
    }

    const payment = await createPayment(
      payload.sub,
      amount,
      body.purpose as 'extra-link' | 'alias-creation' | 'extend-30days',
      body.linkCode
    );

    return response(
      {
        message: "Payment initiated",
        paymentId: payment.paymentId,
        amount: payment.amount,
        purpose: payment.purpose,
        // In real implementation, integrate with Razorpay/Stripe here
        // Return checkout URL or session ID
      },
      { statusCode: 201, origin }
    );
  } catch (error) {
    console.error("Payment initiation error:", error);
    throw error;
  }
};
