export interface LinkItem {
  code: string;
  longUrl: string;
  clickCount: number;
  createdAt: string; // ISO string
  expireAt: number; // epoch seconds
  userId?: string;
}

export interface Name {
  name: string;
}