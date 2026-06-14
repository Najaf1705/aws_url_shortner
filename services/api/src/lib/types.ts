export type CreateLinkBody = {
  longUrl: string;
  expiresInSeconds?: number; // optional; default applied
};

export type UrlItem = {
  code: string;
  clickCount: number;
  userId: string,
  longUrl: string;
  createdAt: string;
  expireAt: number; // epoch seconds (TTL attribute)
};