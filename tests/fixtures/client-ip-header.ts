// Reading the client IP header ad hoc, in every spelling the rule covers.
/**
 * Read the client address the wrong way.
 * @param headers the request headers
 * @returns the raw header values
 */
export function ipsOf(headers: Headers): (string | null)[] {
  return [
    headers.get("x-forwarded-for"),
    headers.get("X-Forwarded-For"),
    headers.get("x-real-ip"),
    headers.get(`x-real-ip`),
  ];
}
