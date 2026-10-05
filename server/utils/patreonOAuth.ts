export type PatreonOAuthConfig = { clientId: string; clientSecret: string; redirectUri: string };
export type PatreonIdentity = { id: string; display_name: string; avatar_url: string };

export function patreonAuthorizationUrl(config: PatreonOAuthConfig, state: string) {
  const url = new URL("https://www.patreon.com/oauth2/authorize");
  url.search = new URLSearchParams({ response_type: "code", client_id: config.clientId,
    redirect_uri: config.redirectUri, scope: "identity", state }).toString();
  return url.toString();
}

export function parsePatreonUser(response: any): PatreonIdentity {
  const user = response?.data;
  if (user?.type !== "user" || typeof user.id !== "string" || !/^\d{1,32}$/.test(user.id)) throw new Error("Invalid Patreon identity");
  const name = typeof user.attributes?.full_name === "string" ? user.attributes.full_name.trim() : "";
  let avatar = "";
  try {
    const url = new URL(user.attributes?.image_url);
    if (url.protocol === "https:" && !url.username && !url.password && !url.port
      && (url.hostname === "patreonusercontent.com" || url.hostname.endsWith(".patreonusercontent.com"))
      && url.toString().length <= 1024) avatar = url.toString();
  } catch { /* A missing or unsupported profile image is optional. */ }
  return { id: user.id, display_name: Array.from(name || "Patreon member").slice(0, 64).join(""), avatar_url: avatar };
}

export async function verifyPatreonCode(code: string, config: PatreonOAuthConfig, fetcher: typeof fetch = fetch): Promise<PatreonIdentity> {
  if (!code || code.length > 512) throw new Error("Invalid Patreon code");
  const response = await fetcher("https://www.patreon.com/api/oauth2/token", {
    method: "POST", redirect: "error", signal: AbortSignal.timeout(10_000),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", code, client_id: config.clientId,
      client_secret: config.clientSecret, redirect_uri: config.redirectUri }),
  });
  if (!response.ok) throw new Error("Patreon authorization failed");
  const token = await response.json();
  if (typeof token.access_token !== "string" || !token.access_token
    || String(token.token_type).toLowerCase() !== "bearer") throw new Error("Invalid Patreon authorization");
  const url = new URL("https://www.patreon.com/api/oauth2/v2/identity");
  url.searchParams.set("fields[user]", "full_name,image_url");
  const user = await fetcher(url, { redirect: "error", signal: AbortSignal.timeout(10_000),
    headers: { Authorization: `Bearer ${token.access_token}` } });
  if (!user.ok) throw new Error("Patreon profile unavailable");
  // Store the proven ID and profile only; never persist a player's OAuth tokens.
  return parsePatreonUser(await user.json());
}
