export function validateLongUrl(longUrl: string) {
  let u: URL;
  try {
    u = new URL(longUrl);
  } catch {
    throw new Error("Invalid URL");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("URL must start with http:// or https://");
  }
}