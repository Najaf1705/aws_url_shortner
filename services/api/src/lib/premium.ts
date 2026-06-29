import { GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "./dynamo";
import { config } from "./config";
import { UserProfile, Payment } from "./types";

const FREE_LINK_QUOTA = 10;
const EXTRA_LINK_COST = 1; // ₹1 per extra link
const ALIAS_CREATION_COST = 1; // ₹1 for alias creation
const EXTEND_30_DAYS_COST = 1; // ₹1 per 30-day extension

/**
 * Get or create user profile to track free links quota
 */
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    const result = await ddb.send(
      new GetCommand({
        TableName: config.usersTableName,
        Key: { userId },
      })
    );

    if (result.Item) {
      return result.Item as UserProfile;
    }

    // Create new user profile
    const now = Math.floor(Date.now() / 1000);
    const newProfile: UserProfile = {
      userId,
      freeLinksUsed: 0,
      createdAt: now,
      lastUpdated: now,
    };

    await ddb.send(
      new PutCommand({
        TableName: config.usersTableName,
        Item: newProfile,
      })
    );

    return newProfile;
  } catch (error) {
    console.error("Failed to get user profile:", error);
    throw new Error("Unable to fetch user profile");
  }
};

/**
 * Check if user can create a free link (returns true if within quota)
 * If quota exceeded, a payment is required
 */
export const canCreateFreeLink = async (userId: string): Promise<boolean> => {
  const profile = await getUserProfile(userId);
  return profile.freeLinksUsed < FREE_LINK_QUOTA;
};

/**
 * Increment free links used count
 */
export const incrementFreeLinksUsed = async (userId: string): Promise<void> => {
  const now = Math.floor(Date.now() / 1000);
  await ddb.send(
    new UpdateCommand({
      TableName: config.usersTableName,
      Key: { userId },
      UpdateExpression: "SET freeLinksUsed = freeLinksUsed + :inc, lastUpdated = :now",
      ExpressionAttributeValues: {
        ":inc": 1,
        ":now": now,
      },
    })
  );
};

export const getPayment = async (paymentId: string): Promise<Payment | null> => {
  const result = await ddb.send(
    new GetCommand({
      TableName: config.paymentsTableName,
      Key: { paymentId },
    })
  );

  return (result.Item as Payment | undefined) ?? null;
};

/**
 * Create a pending payment record
 */
export const createPayment = async (
  userId: string,
  amount: number,
  purpose: 'extra-link' | 'alias-creation' | 'extend-30days',
  linkCode?: string
): Promise<Payment> => {
  const now = Math.floor(Date.now() / 1000);
  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const payment: Payment = {
    paymentId,
    userId,
    amount,
    purpose,
    status: 'pending',
    linkCode,
    createdAt: now,
  };

  await ddb.send(
    new PutCommand({
      TableName: config.paymentsTableName,
      Item: payment,
    })
  );

  return payment;
};

/**
 * Mark payment as completed
 */
export const completePayment = async (
  paymentId: string,
  razorpayData?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  }
): Promise<void> => {
  const now = Math.floor(Date.now() / 1000);
  const updateExpressions = [
    "#status = :completed",
    "completedAt = :now",
  ];
  const expressionAttributeValues: Record<string, unknown> = {
    ":completed": "completed",
    ":now": now,
  };
  const expressionAttributeNames = {
    "#status": "status",
  };

  if (razorpayData?.razorpayOrderId) {
    updateExpressions.push("razorpayOrderId = :razorpayOrderId");
    expressionAttributeValues[":razorpayOrderId"] = razorpayData.razorpayOrderId;
  }

  if (razorpayData?.razorpayPaymentId) {
    updateExpressions.push("razorpayPaymentId = :razorpayPaymentId");
    expressionAttributeValues[":razorpayPaymentId"] = razorpayData.razorpayPaymentId;
  }

  if (razorpayData?.razorpaySignature) {
    updateExpressions.push("razorpaySignature = :razorpaySignature");
    expressionAttributeValues[":razorpaySignature"] = razorpayData.razorpaySignature;
  }

  await ddb.send(
    new UpdateCommand({
      TableName: config.paymentsTableName,
      Key: { paymentId },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    })
  );
};

export const PRICING = {
  FREE_LINK_QUOTA,
  EXTRA_LINK_COST,
  ALIAS_CREATION_COST,
  EXTEND_30_DAYS_COST,
};
