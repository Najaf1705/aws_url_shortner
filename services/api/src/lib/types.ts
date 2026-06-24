export type CreateLinkBody = {
  longUrl: string;
  // Expect absolute epoch seconds for expiry (required)
  expiresAt?: number;
  alias?: string;
  guestId?: string;
};

export type UrlItem = {
  code: string;
  clickCount: number;
  userId: string,
  longUrl: string;
  createdAt: number;
  expireAt: number; // epoch seconds (TTL attribute)
};
