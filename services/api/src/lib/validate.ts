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
  // Block certain internal/self domains to prevent short-looping or abuse
  const bannedHosts = ["short.najaf.in"];
  const hostname = (u.hostname || "").toLowerCase();

  for (const banned of bannedHosts) {
    if (hostname === banned || hostname.endsWith(`.${banned}`)) {
      // Surface as an invalid URL so callers map to the existing client error handling
      throw new Error("Banned domain URL");
    }
  }
}