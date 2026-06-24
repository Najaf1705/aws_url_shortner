export interface LinkItem {
  code: string;
  longUrl: string;
  clickCount: number;
  createdAt: number; // epoch seconds
  expireAt: number; // epoch seconds
  userId?: string;
}

export interface Name {
  name: string;
}