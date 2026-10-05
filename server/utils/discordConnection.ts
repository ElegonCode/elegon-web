import type { H3Event } from "h3";
import type { DiscordOAuthConfig } from "./discordOAuth";
import { timingSafeEqual } from "node:crypto";

export function discordConnectionAvailable(event: H3Event) {
  const config = useRuntimeConfig(event);
  return /^\d{17,20}$/.test(config.discordClientId) && !!config.discordClientSecret;
}
export function discordConnectionConfig(event: H3Event): DiscordOAuthConfig {
  if (!discordConnectionAvailable(event)) throw createError({ statusCode: 503, statusMessage: "Discord connections are not configured yet" });
  const config = useRuntimeConfig(event);
  return { clientId: config.discordClientId, clientSecret: config.discordClientSecret,
    redirectUri: `${accountConfig(event).origin}/auth/discord/callback` };
}
export function discordStateCookie(event: H3Event) {
  return accountConfig(event).secure ? "__Host-elegon_discord_state" : "elegon_discord_state_dev";
}
export function verifiedDiscordCallback(params: URLSearchParams, expected: string | undefined) {
  for (const key of params.keys()) if (params.getAll(key).length !== 1) throw new Error("Duplicate callback parameter");
  const state = params.get("state") ?? "";
  if (!/^[a-f0-9]{64}$/.test(state) || !expected || !/^[a-f0-9]{64}$/.test(expected)
    || !timingSafeEqual(Buffer.from(state), Buffer.from(expected))) throw new Error("Discord linking expired");
  return { state, code: params.get("code") ?? "", cancelled: params.has("error") };
}
