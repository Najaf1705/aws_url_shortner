export type CreateLinkBody = {
  longUrl: string;
  // Expect absolute epoch seconds for expiry (required)
  expiresAt?: number;
  alias?: string;
  guestId?: string;
  paymentId?: string;
};

export type UrlItem = {
  code: string;
  clickCount: number;
  userId: string,
  longUrl: string;
  createdAt: number;
  expireAt: number; // epoch seconds (TTL attribute)
  isPaid?: boolean; // whether this link was paid for
  paidAmount?: number; // cost in rupees if paid
};

export type UserProfile = {
  userId: string;
  freeLinksUsed: number;
  createdAt: number;
  lastUpdated: number;
};

export type Payment = {
  paymentId: string;
  userId: string;
  amount: number; // in rupees
  purpose: 'extra-link' | 'alias-creation' | 'extend-30days';
  status: 'pending' | 'completed' | 'failed';
  linkCode?: string;
  createdAt: number;
  completedAt?: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
};
