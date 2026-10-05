const AUTHORIZE_URL = "https://discord.com/oauth2/authorize";
const TOKEN_URL = "https://discord.com/api/oauth2/token";
const USER_URL = "https://discord.com/api/v10/users/@me";

export type DiscordOAuthConfig = { clientId: string; clientSecret: string; redirectUri: string };
export type DiscordIdentity = { id: string; display_name: string; avatar_url: string };

export function discordAuthorizationUrl(config: DiscordOAuthConfig, state: string) {
  const url = new URL(AUTHORIZE_URL);
  url.search = new URLSearchParams({ client_id: config.clientId, redirect_uri: config.redirectUri,
    response_type: "code", scope: "identify", state, prompt: "consent" }).toString();
  return url.toString();
}

export function parseDiscordUser(user: any): DiscordIdentity {
  if (!user || typeof user.id !== "string" || !/^\d{17,20}$/.test(user.id)
    || typeof user.username !== "string" || !user.username || user.username.length > 32 || user.bot) {
    throw new Error("Invalid Discord user");
  }
  const name = typeof user.global_name === "string" && user.global_name
    ? user.global_name : user.discriminator && user.discriminator !== "0"
      ? `${user.username}#${user.discriminator}` : user.username;
  const avatar = typeof user.avatar === "string" && /^(a_)?[a-f0-9]{32}$/.test(user.avatar)
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128` : "";
  return { id: user.id, display_name: name.slice(0, 80), avatar_url: avatar };
}

export async function verifyDiscordCode(code: string, config: DiscordOAuthConfig, fetcher: typeof fetch = fetch): Promise<DiscordIdentity> {
  if (!code || code.length > 512) throw new Error("Invalid Discord code");
  const tokenResponse = await fetcher(TOKEN_URL, {
    method: "POST", redirect: "error", signal: AbortSignal.timeout(10_000),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", code,
      client_id: config.clientId, client_secret: config.clientSecret, redirect_uri: config.redirectUri }),
  });
  if (!tokenResponse.ok) throw new Error("Discord authorization failed");
  const token = await tokenResponse.json();
  if (token.token_type !== "Bearer" || typeof token.access_token !== "string" || !token.access_token
    || typeof token.scope !== "string" || !token.scope.split(" ").includes("identify")) {
    throw new Error("Invalid Discord authorization");
  }
  const userResponse = await fetcher(USER_URL, { redirect: "error", signal: AbortSignal.timeout(10_000),
    headers: { Authorization: `Bearer ${token.access_token}` } });
  if (!userResponse.ok) throw new Error("Discord profile unavailable");
  // Only the proven identity leaves this function. Access and refresh tokens are not stored.
  return parseDiscordUser(await userResponse.json());
}
