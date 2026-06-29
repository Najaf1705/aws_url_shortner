export function formatExpireAt(expireAt: number) {
  return new Date(expireAt * 1000).toLocaleDateString("en-GB");
}