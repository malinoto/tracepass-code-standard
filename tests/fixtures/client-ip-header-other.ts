// Other headers stay readable.
/**
 * Read the user agent.
 * @param headers the request headers
 * @returns the user agent
 */
export function agentOf(headers: Headers): string | null {
  return headers.get("user-agent");
}
