import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function verifyAccessToken(
  token: string
) {
  console.log("Verify JWT_SECRET exists:", !!process.env.JWT_SECRET);
  console.log("JWT_SECRET length:", process.env.JWT_SECRET?.length);
  return jwt.verify(
    token,
    JWT_SECRET
  ) as {
    sub: string;
    email: string;
  };
}